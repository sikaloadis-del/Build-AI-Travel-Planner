import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = process.env.PORT || 3000
const distDir = path.resolve(__dirname, 'dist')
const distIndex = path.join(distDir, 'index.html')

app.get('/api/proxy', async (req, res) => {
  const target = req.query.url
  if (!target || typeof target !== 'string') {
    return res.status(400).json({ error: 'Missing url query parameter' })
  }
  let parsed
  try { parsed = new URL(target) } catch { return res.status(400).json({ error: 'Invalid URL' }) }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'Unsupported URL protocol' })
  }
  try {
    const upstream = await fetch(parsed, {
      headers: {
        'Accept': 'application/json,text/plain,*/*',
        'User-Agent': 'AITravelPlanner/0.2 (+https://github.com/sikaloadis-del/Build-AI-Travel-Planner)',
      },
      redirect: 'follow',
    })
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
    const body = Buffer.from(await upstream.arrayBuffer())
    res.status(upstream.status).type(contentType).send(body)
  } catch (error) {
    res.status(502).json({ error: 'Provider request failed', detail: error.message })
  }
})

if (!fs.existsSync(distIndex)) {
  console.error(`Production build not found at ${distIndex}. Run \`npm run build\` before \`npm start\`.`)
  process.exit(1)
}

app.use(
  '/assets',
  express.static(path.join(distDir, 'assets'), {
    index: false,
    fallthrough: false,
    setHeaders(res) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    },
  }),
)

app.use('/assets', (err, _req, res, next) => {
  if (err?.status === 404) {
    return res.status(404).type('text/plain').send('Asset not found')
  }
  next(err)
})

app.use((req, res, next) => {
  if (req.path.includes('.')) {
    return express.static(distDir, { index: false })(req, res, next)
  }
  next()
})

app.get('*splat', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  res.sendFile(distIndex)
})

app.listen(port, () => {
  console.log(`AI Travel Planner serving ${distDir} on ${port}`)
})
