import { useState } from 'react'
import { useData } from '../context/data'
import { RelatedGraph } from '../components/RelatedGraph'

interface DictionaryProps {
  selectedId: string
  onSelect: (id: string) => void
}

export function Dictionary({ selectedId, onSelect }: DictionaryProps) {
  const { terms, modules, byId } = useData()
  const [query, setQuery] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')

  const filtered = terms.filter(t => {
    if (moduleFilter !== 'all' && t.module !== moduleFilter) return false
    if (query) {
      const q = query.toLowerCase()
      return (
        t.term.toLowerCase().includes(q) ||
        t.expand.toLowerCase().includes(q) ||
        t.def.toLowerCase().includes(q)
      )
    }
    return true
  })

  const current = byId[selectedId] || filtered[0] || terms[0]
  const mod = current ? modules.find(m => m.id === current.module) : null

  return (
    <div className="dictionary">
      {/* Left: term list */}
      <div className="dict-list">
        <div className="dict-search">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="grep terms…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span className="kbd">/</span>
        </div>

        <div className="dict-filters">
          <button
            className={`filter-chip ${moduleFilter === 'all' ? 'active' : ''}`}
            onClick={() => setModuleFilter('all')}
          >
            all
          </button>
          {modules.map(m => (
            <button
              key={m.id}
              className={`filter-chip ${moduleFilter === m.id ? 'active' : ''}`}
              onClick={() => setModuleFilter(m.id)}
            >
              <span className="dot" style={{ background: m.color }} />
              {m.id}
            </button>
          ))}
        </div>

        <div className="dict-count">{String(filtered.length).padStart(3, '0')} entries</div>

        <div className="dict-rows">
          {filtered.map(t => {
            const m = modules.find(mo => mo.id === t.module)
            return (
              <div
                key={t.id}
                className={`dict-row ${current?.id === t.id ? 'active' : ''}`}
                onClick={() => onSelect(t.id)}
              >
                <span className="dict-row-dot" style={{ background: m?.color }} />
                <div className="dict-row-text">
                  <div className="dict-row-term">{t.term}</div>
                  <div className="dict-row-expand">{t.expand}</div>
                </div>
                <span className="dict-row-mod">{t.module}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: term detail */}
      <div className="dict-detail">
        {current && mod && (
          <>
            <div className="detail-header">
              <div className="detail-path">
                <span className="dot" style={{ background: mod.color }} />
                <span>{mod.code}</span>
                <span className="topic-sep">/</span>
                <span>{current.topic}</span>
              </div>
              <div className="detail-actions">
                <button className="btn-ghost">★ bookmark</button>
                <button className="btn-ghost">⎘ copy</button>
              </div>
            </div>

            <div className="detail-term">{current.term}</div>
            <div className="detail-expand">{current.expand}</div>

            <div className="detail-section">
              <div className="detail-label">// definition</div>
              <div className="detail-def">{current.def}</div>
            </div>

            <div className="detail-section">
              <div className="detail-label">// example_usage</div>
              <div className="detail-code">
                <span className="code-line">
                  <span className="code-prompt">$</span> man {current.term.toLowerCase()}
                </span>
                <span className="code-line code-comment">
                  # see also: {(current.related || []).slice(0, 3).join(', ')}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <div className="detail-label">// related_concepts</div>
              <RelatedGraph term={current} onPick={id => onSelect(id)} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
