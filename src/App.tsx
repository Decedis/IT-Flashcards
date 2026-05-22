import { useState, useEffect } from 'react'

import { useAuth } from './context/auth'
import { DataCtx } from './context/data'
import { useFlashcardData } from './hooks/useFlashcardData'
import { useStats } from './hooks/useStats'
import { clearCache } from './lib/cache'
import { ACCENT_PRESETS } from './lib/constants'

import { TopBar } from './components/TopBar'
import { BottomBar } from './components/BottomBar'
import { LoadingScreen } from './components/LoadingScreen'
import { ErrorScreen } from './components/ErrorScreen'

import { LoginView } from './views/LoginView'
import { HomeView } from './views/HomeView'
import { ModulesView } from './views/ModulesView'
import { Dictionary } from './views/Dictionary'
import { Practice } from './views/Practice'

import type { View, PracticeMode } from './types'

// ─── Authenticated shell ──────────────────────────────────────────────────────
// Hooks are always called — extracted into AppShell so the conditional
// `if (!token) return <LoginView />` in App doesn't violate Rules of Hooks.

function AppShell() {
  const { appData, loading, error } = useFlashcardData()
  const { stats, patchStats } = useStats()

  const [view, setView]                   = useState<View>('home')
  const [selectedTerm, setSelectedTerm]   = useState('tcp')
  const [practiceModule, setPracticeModule] = useState('all')
  const [practiceMode]                    = useState<PracticeMode>('mixed')
  const [accent, setAccent]               = useState('#22c55e')
  const [retryKey, setRetryKey]           = useState(0)

  useEffect(() => {
    const preset = ACCENT_PRESETS[accent] || ACCENT_PRESETS['#22c55e']
    const root = document.documentElement
    root.style.setProperty('--accent', preset.fg)
    root.style.setProperty('--accent-2', preset.a2)
    root.style.setProperty('--accent-3', preset.a3)
    root.style.setProperty('--accent-4', preset.a4)
  }, [accent])

  function navigate(v: View, termId?: string) {
    setView(v)
    if (termId) setSelectedTerm(termId)
  }

  function handleRetry() {
    clearCache()
    setRetryKey(k => k + 1)
  }

  if (loading) return <LoadingScreen />
  if (error || !appData) return <ErrorScreen onRetry={handleRetry} />

  const initialStats = {
    streak:  stats?.streak  ?? 0,
    correct: stats?.correct ?? 0,
    wrong:   stats?.wrong   ?? 0,
  }

  return (
    <DataCtx.Provider key={retryKey} value={appData}>
      <div className="app">
        <TopBar
          view={view}
          accent={accent}
          onViewChange={setView}
          onAccentChange={setAccent}
        />

        <main className="view">
          {view === 'home' && (
            <HomeView onNavigate={navigate} stats={stats} />
          )}
          {view === 'modules' && (
            <ModulesView onPickModule={id => { setPracticeModule(id); setView('practice') }} />
          )}
          {view === 'dictionary' && (
            <Dictionary selectedId={selectedTerm} onSelect={setSelectedTerm} />
          )}
          {view === 'practice' && (
            <Practice
              key={`${practiceModule}-${practiceMode}`}
              moduleId={practiceModule}
              mode={practiceMode}
              onNavigate={navigate}
              initialStats={initialStats}
              onStatsUpdate={patchStats}
            />
          )}
        </main>

        <BottomBar view={view} />
      </div>
    </DataCtx.Provider>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const { token } = useAuth()
  return token ? <AppShell /> : <LoginView />
}
