import type { View } from '../types'

interface BottomBarProps {
  view: View
}

export function BottomBar({ view }: BottomBarProps) {
  const path = view === 'home' ? '~' : `~/${view}`

  return (
    <footer className="bottom-bar">
      <div className="cli-line">
        <span className="cli-prompt accent">student@flashcards</span>
        <span className="muted">:</span>
        <span className="cli-path">{path}</span>
        <span className="muted">$</span>
        <span className="cli-blink">▋</span>
      </div>
      <div className="bottom-keys">
        <span><span className="kbd">/</span> search</span>
        <span><span className="kbd">A–D</span> answer</span>
        <span><span className="kbd">↵</span> next</span>
      </div>
    </footer>
  )
}
