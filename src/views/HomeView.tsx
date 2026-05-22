import { useData } from '../context/data'
import type { Stats, View } from '../types'

interface HomeViewProps {
  onNavigate: (view: View, termId?: string) => void
  stats: Stats | null
}

export function HomeView({ onNavigate, stats }: HomeViewProps) {
  const { terms, modules, byId } = useData()

  const totalTerms = terms.length
  const mastered = modules.reduce((acc, m) => {
    const c = terms.filter(t => t.module === m.id).length
    return acc + Math.round(c * m.progress)
  }, 0)
  const overallPct = totalTerms > 0 ? Math.round((mastered / totalTerms) * 100) : 0
  const accuracy =
    stats && stats.correct + stats.wrong > 0
      ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100)
      : null

  const heatmap =
    stats?.activity?.length === 28
      ? stats.activity
      : Array.from({ length: 28 }, (_, i) => {
          const seed = (i * 9301 + 49297) % 233280
          return Math.round((seed / 233280) * 30)
        })

  const todayIds = ['tcp', 'tls', 'raid', 'subnet', 'zero_day', 'bsod', 'docker', 'cia_triad']
  const todays = todayIds.map(id => byId[id]).filter(Boolean).slice(0, 6)

  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-meta">
          <span className="cli-prompt">$</span>
          <span className="cli-cmd">whoami</span>
        </div>
        <h1 className="hero-title">
          user.<span className="accent">student</span>
        </h1>
        <div className="hero-sub">CompTIA track · {totalTerms} terms loaded</div>

        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num accent">
              {overallPct}<span className="stat-unit">%</span>
            </div>
            <div className="stat-label">overall_progress</div>
          </div>
          <div className="stat">
            <div className="stat-num">
              {mastered}<span className="stat-unit">/{totalTerms}</span>
            </div>
            <div className="stat-label">terms_mastered</div>
          </div>
          <div className="stat">
            <div className="stat-num">{stats?.streak ?? '—'}</div>
            <div className="stat-label">day_streak 🔥</div>
          </div>
          <div className="stat">
            <div className="stat-num">
              {accuracy !== null ? accuracy : '—'}
              <span className="stat-unit">{accuracy !== null ? '%' : ''}</span>
            </div>
            <div className="stat-label">accuracy_all_time</div>
          </div>
        </div>
      </div>

      <div className="home-grid">
        {/* Activity heatmap */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-label">// activity_28d</span>
            <span className="muted">cards reviewed</span>
          </div>
          <div className="heatmap">
            {heatmap.map((v, i) => {
              const norm = Math.min(v / 30, 1)
              return (
                <div
                  key={i}
                  className="heatcell"
                  style={{ background: `oklch(0.35 ${norm * 0.12} 145 / ${0.15 + norm * 0.85})` }}
                  title={`day ${i + 1}: ${v} cards`}
                />
              )
            })}
          </div>
          <div className="heatmap-legend">
            <span className="muted">less</span>
            {[0.2, 0.5, 0.8, 1].map((op, i) => (
              <div
                key={i}
                className="heatcell"
                style={{ background: `oklch(0.35 ${(i + 1) * 0.03} 145 / ${op})`, width: 12, height: 12 }}
              />
            ))}
            <span className="muted">more</span>
          </div>
        </div>

        {/* Next-up queue */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-label">// next_up</span>
            <span className="muted">queued today</span>
          </div>
          <div className="queue">
            {todays.map((t, i) => {
              const m = modules.find(mo => mo.id === t.module)!
              return (
                <div key={t.id} className="queue-row" onClick={() => onNavigate('dictionary', t.id)}>
                  <span className="queue-idx">{String(i + 1).padStart(2, '0')}</span>
                  <span className="queue-dot" style={{ background: m?.color }} />
                  <div className="queue-text">
                    <div className="queue-term">{t.term}</div>
                    <div className="queue-expand">{t.expand}</div>
                  </div>
                  <span className="queue-mod muted">{m?.code}</span>
                </div>
              )
            })}
          </div>
          <button className="btn-primary full" onClick={() => onNavigate('practice')}>
            › begin practice session
          </button>
        </div>

        {/* Module progress */}
        <div className="panel module-progress-panel">
          <div className="panel-header">
            <span className="panel-label">// module_progress</span>
          </div>
          {modules.map(m => {
            const c = terms.filter(t => t.module === m.id).length
            return (
              <div key={m.id} className="mp-row" onClick={() => onNavigate('modules')}>
                <span className="mp-dot" style={{ background: m.color }} />
                <span className="mp-code">{m.code}</span>
                <span className="mp-name">{m.name}</span>
                <div className="mp-bar">
                  <div className="mp-bar-fill" style={{ width: `${m.progress * 100}%`, background: m.color }} />
                </div>
                <span className="mp-pct">{Math.round(m.progress * 100)}%</span>
                <span className="mp-count muted">{Math.round(c * m.progress)}/{c}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
