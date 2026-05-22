import { ACCENT_PRESETS } from '../lib/constants'
import type { View } from '../types'

interface TopBarProps {
  view: View
  accent: string
  onViewChange: (v: View) => void
  onAccentChange: (color: string) => void
}

const NAV_ITEMS: [View, string][] = [
  ['home', '~/home'],
  ['modules', '~/modules'],
  ['dictionary', '~/dict'],
  ['practice', '~/practice'],
]

export function TopBar({ view, accent, onViewChange, onAccentChange }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="brand">
        <div className="brand-mark">
          <span className="bracket">[</span>
          <span className="brand-letters">IT</span>
          <span className="bracket">]</span>
        </div>
        <div className="brand-text">
          <div className="brand-title">flashcards<span className="caret">_</span></div>
          <div className="brand-sub">v0.4.2 · comptia track</div>
        </div>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map(([k, label]) => (
          <button
            key={k}
            className={`nav-btn ${view === k ? 'active' : ''}`}
            onClick={() => onViewChange(k)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="top-right">
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {Object.keys(ACCENT_PRESETS).map(color => (
            <button
              key={color}
              onClick={() => onAccentChange(color)}
              title={color}
              style={{
                width: 14, height: 14, borderRadius: '50%', background: color,
                border: accent === color ? '2px solid white' : '2px solid transparent',
                padding: 0, outline: 'none', cursor: 'pointer',
              }}
            />
          ))}
        </div>
        <div className="status-pill">
          <span className="status-dot" />
          <span>synced</span>
        </div>
        <div className="user-pill">
          <span className="user-avatar">S</span>
          <span>student.dev</span>
        </div>
      </div>
    </header>
  )
}
