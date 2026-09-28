import { CACHE_POLICIES } from './config.js'

export class DataGateway {
  constructor({ token, storage }) { this.token = token; this.storage = storage; this.inflight = new Map(); this.logs = [] }
  log(event) { this.logs = [{ ...event, at: new Date().toISOString() }, ...this.logs].slice(0, 80); console.info('[travel]', event) }
  async proxyJson(url, { cacheKey, policy = CACHE_POLICIES.cityInfo, headers = {} } = {}) {
    const key = cacheKey || `cache:${url}`
    const cached = await this.readCache(key)
    if (cached) return { ...cached.value, _cache: { hit: true, retrievedAt: cached.retrievedAt, expiresAt: cached.expiresAt } }
    if (this.inflight.has(key)) return this.inflight.get(key)
    const promise = this.fetchJson(url, headers).then(async (value) => {
      await this.writeCache(key, value, policy)
      return { ...value, _cache: { hit: false } }
    }).finally(() => this.inflight.delete(key))
    this.inflight.set(key, promise)
    return promise
  }
  async fetchJson(url, headers = {}) {
    const start = performance.now()
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, { headers: { Authorization: `Bearer ${this.token}`, ...headers } })
    const latencyMs = Math.round(performance.now() - start)
    if (!res.ok) { this.log({ level: 'error', type: 'external-api', url, status: res.status, latencyMs }); throw new Error(`Provider request failed (${res.status})`) }
    this.log({ level: 'info', type: 'external-api', url: new URL(url).hostname, status: res.status, latencyMs })
    return res.json()
  }
  async readCache(key) {
    if (!this.storage) return null
    try {
      const cached = await this.storage.get(key)
      if (!cached) return null
      if (cached.expiresAt && new Date(cached.expiresAt) < new Date()) return null
      return cached
    } catch (error) { this.log({ level: 'warn', type: 'cache-read', key, message: error.message }); return null }
  }
  async writeCache(key, value, policy) {
    if (!this.storage) return
    try {
      await this.storage.set(key, { value, retrievedAt: new Date().toISOString(), expiresAt: policy.ttlMs === Infinity ? null : new Date(Date.now() + policy.ttlMs).toISOString(), policy: policy.label })
    } catch (error) { this.log({ level: 'warn', type: 'cache-write', key, message: error.message }) }
  }
}
