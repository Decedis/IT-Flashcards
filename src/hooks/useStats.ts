import { useState, useEffect, useCallback } from 'react'
import type { Stats } from '../types'
import { authFetch } from '../lib/authFetch'

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    authFetch('/api/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setStats(d))
      .catch(() => {})
  }, [])

  const patchStats = useCallback(async (
    updates: Partial<Pick<Stats, 'correct' | 'wrong' | 'streak'>>
  ) => {
    try {
      const r = await authFetch('/api/stats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (r.ok) setStats(await r.json())
    } catch {}
  }, [])

  return { stats, patchStats }
}
