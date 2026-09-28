import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = process.env.PORT || 3000

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

app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))
app.listen(port, () => console.log(`AI Travel Planner listening on ${port}`))
