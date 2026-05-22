import type { Term, Module } from '../types'

const CACHE_KEY = 'itfc_v1'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

interface CachePayload {
  terms: Term[]
  modules: Module[]
  cachedAt: number
}

export function readCache(): { terms: Term[]; modules: Module[] } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const p: CachePayload = JSON.parse(raw)
    if (Date.now() - p.cachedAt > CACHE_TTL_MS) return null
    return { terms: p.terms, modules: p.modules }
  } catch {
    return null
  }
}

export function writeCache(terms: Term[], modules: Module[]) {
  try {
    const p: CachePayload = { terms, modules, cachedAt: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(p))
  } catch {}
}

export function clearCache() {
  try { localStorage.removeItem(CACHE_KEY) } catch {}
}
