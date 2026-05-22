import type { Term, Module, AppData } from '../types'
import { authFetch } from './authFetch'

export function deriveTopics(terms: Term[]): Record<string, string[]> {
  const map: Record<string, string[]> = {}
  for (const t of terms) {
    if (!map[t.module]) map[t.module] = []
    if (!map[t.module].includes(t.topic)) map[t.module].push(t.topic)
  }
  return map
}

export function buildAppData(terms: Term[], modules: Module[]): AppData {
  return {
    terms,
    modules,
    byId: Object.fromEntries(terms.map(t => [t.id, t])),
    moduleTopics: deriveTopics(terms),
  }
}

export async function fetchFromApi(): Promise<AppData | null> {
  try {
    const [tr, mr] = await Promise.all([authFetch('/api/terms'), authFetch('/api/modules')])
    if (!tr.ok || !mr.ok) return null
    const rawTerms: any[] = await tr.json()
    const rawModules: any[] = await mr.json()
    const terms: Term[] = rawTerms.map(t => ({
      id: t.id, term: t.term, expand: t.expand, def: t.def,
      module: t.moduleId, topic: t.topic,
      related: Array.isArray(t.related) ? t.related : JSON.parse(t.related ?? '[]'),
    }))
    const modules: Module[] = rawModules.map(m => ({
      id: m.id, code: m.code, name: m.name, color: m.color, progress: m.progress,
    }))
    return buildAppData(terms, modules)
  } catch {
    return null
  }
}
