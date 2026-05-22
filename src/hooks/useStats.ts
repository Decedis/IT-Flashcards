import { useState, useEffect, useCallback } from 'react'
import type { Stats } from '../types'

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setStats(d))
      .catch(() => {})
  }, [])

  const patchStats = useCallback(async (
    updates: Partial<Pick<Stats, 'correct' | 'wrong' | 'streak'>>
  ) => {
    try {
      const r = await fetch('/api/stats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (r.ok) setStats(await r.json())
    } catch {}
  }, [])

  return { stats, patchStats }
}
