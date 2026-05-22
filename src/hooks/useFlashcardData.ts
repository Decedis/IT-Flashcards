import { useState, useEffect } from 'react'
import type { AppData } from '../types'
import { readCache, writeCache } from '../lib/cache'
import { buildAppData, fetchFromApi } from '../lib/api'

export function useFlashcardData() {
  const [appData, setAppData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      const cached = readCache()

      if (cached) {
        if (mounted) {
          setAppData(buildAppData(cached.terms, cached.modules))
          setLoading(false)
        }
        // Silently refresh in background — no spinner
        fetchFromApi().then(fresh => {
          if (!mounted || !fresh) return
          writeCache(fresh.terms, fresh.modules)
          setAppData(fresh)
        })
        return
      }

      const fresh = await fetchFromApi()
      if (!mounted) return
      if (fresh) {
        writeCache(fresh.terms, fresh.modules)
        setAppData(fresh)
      } else {
        setError(true)
      }
      setLoading(false)
    }

    load()
    return () => { mounted = false }
  }, [])

  return { appData, loading, error }
}
