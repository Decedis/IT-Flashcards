import { useState, useEffect, useMemo } from 'react'
import { useData } from '../context/data'
import { RelatedGraph } from '../components/RelatedGraph'
import { pickRandom, shuffle } from '../lib/utils'
import type { Term, View, PracticeMode } from '../types'

interface PracticeProps {
  moduleId: string
  mode: PracticeMode
  onNavigate: (view: View, termId?: string) => void
  initialStats: { streak: number; correct: number; wrong: number }
  onStatsUpdate: (updates: { streak: number; correct: number; wrong: number }) => void
}

export function Practice({ moduleId, mode, onNavigate, initialStats, onStatsUpdate }: PracticeProps) {
  const { terms, modules } = useData()

  const pool = useMemo(
    () => moduleId === 'all' ? terms : terms.filter(t => t.module === moduleId),
    [moduleId, terms]
  )

  const [questionIdx, setQuestionIdx] = useState(0)
  const [streak, setStreak] = useState(initialStats.streak)
  const [correctCount, setCorrectCount] = useState(initialStats.correct)
  const [wrongCount, setWrongCount] = useState(initialStats.wrong)
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const direction = mode === 'mixed' ? (questionIdx % 2 === 0 ? 't2d' : 'd2t') : mode

  const { current, choices } = useMemo(() => {
    if (!pool.length) return { current: null, choices: [] as Term[] }
    const c = pool[questionIdx % pool.length]
    const distractors = pickRandom(terms, 3, c.id)
    return { current: c, choices: shuffle([c, ...distractors]) }
  }, [questionIdx, pool, terms])

  const mod = current ? modules.find(m => m.id === current.module) : null

  function handlePick(choice: Term) {
    if (revealed || !current) return
    setSelected(choice.id)
    setRevealed(true)
    if (choice.id === current.id) {
      const ns = streak + 1, nc = correctCount + 1
      setStreak(ns)
      setCorrectCount(nc)
      onStatsUpdate({ streak: ns, correct: nc, wrong: wrongCount })
    } else {
      const nw = wrongCount + 1
      setStreak(0)
      setWrongCount(nw)
      onStatsUpdate({ streak: 0, correct: correctCount, wrong: nw })
    }
  }

  function next() {
    setSelected(null)
    setRevealed(false)
    setQuestionIdx(i => i + 1)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && revealed) { next(); return }
      if (revealed) return
      const idx = ['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase())
      if (idx >= 0 && idx < choices.length) handlePick(choices[idx])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [revealed, choices])

  if (!current || !mod) return null

  return (
    <div className="practice">
      {/* Breadcrumb / stats bar */}
      <div className="topic-bar">
        <div className="topic-bar-left">
          <span className="dot" style={{ background: mod.color }} />
          <span className="topic-code">{mod.code}</span>
          <span className="topic-sep">/</span>
          <span className="topic-name">{mod.name}</span>
          <span className="topic-sep">/</span>
          <span className="topic-current">{current.topic}</span>
        </div>
        <div className="topic-bar-right">
          <span className="muted">q.{String(questionIdx + 1).padStart(3, '0')}</span>
          <span className="muted">·</span>
          <span>streak <span className="accent">{streak}</span></span>
          <span className="muted">·</span>
          <span className="good">{correctCount}✓</span>
          <span className="bad">{wrongCount}✕</span>
        </div>
      </div>

      {/* Prompt card */}
      <div className="prompt-card">
        <div className="prompt-meta">
          <span className="cli-prompt">$</span>
          <span className="cli-cmd">
            flashcard.{direction === 't2d' ? 'select_definition' : 'select_term'}
          </span>
          <span className="cli-flag">--mode={direction}</span>
        </div>

        {direction === 't2d' ? (
          <div className="prompt-body prompt-body-term">
            <div className="prompt-term">{current.term}</div>
            <div className="prompt-expand">{current.expand}</div>
            <div className="prompt-question">› What does this stand for / mean?</div>
          </div>
        ) : (
          <div className="prompt-body prompt-body-def">
            <div className="prompt-question">› Which term matches this definition?</div>
            <div className="prompt-def">"{current.def}"</div>
          </div>
        )}

        {/* Answer choices */}
        <div className="choices">
          {choices.map((c, i) => {
            const isCorrect = c.id === current.id
            const isSelected = selected === c.id
            let state = ''
            if (revealed) state = isCorrect ? 'correct' : isSelected ? 'wrong' : 'dim'
            return (
              <button
                key={c.id}
                className={`choice ${state}`}
                disabled={revealed}
                onClick={() => handlePick(c)}
              >
                <span className="choice-key">{String.fromCharCode(65 + i)}</span>
                <span className="choice-body">
                  {direction === 't2d' ? (
                    <span className="choice-primary">{c.def}</span>
                  ) : (
                    <>
                      <span className="choice-primary">{c.term}</span>
                      <span className="choice-secondary">{c.expand}</span>
                    </>
                  )}
                </span>
                <span className="choice-status">
                  {revealed && isCorrect && '✓'}
                  {revealed && isSelected && !isCorrect && '✕'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        <div className={`feedback ${revealed ? 'show' : ''}`}>
          {revealed && (
            <>
              <div className="feedback-text">
                {selected === current.id ? (
                  <span className="good">// correct — committed to memory</span>
                ) : (
                  <span className="bad">
                    // incorrect — answer was <strong>{current.term}</strong>
                  </span>
                )}
              </div>
              <button className="btn-next" onClick={next}>
                next → <span className="kbd">↵</span>
              </button>
            </>
          )}
        </div>
      </div>

      <RelatedGraph term={current} onPick={id => onNavigate('dictionary', id)} />
    </div>
  )
}
