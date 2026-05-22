import { useData } from '../context/data'

interface ModulesViewProps {
  onPickModule: (id: string) => void
}

export function ModulesView({ onPickModule }: ModulesViewProps) {
  const { terms, modules, moduleTopics } = useData()

  return (
    <div className="modules">
      <div className="section-header">
        <span className="section-label">// modules</span>
        <span className="muted">{modules.length} active · 1 archived</span>
      </div>
      <div className="modules-grid">
        {modules.map(m => {
          const count = terms.filter(t => t.module === m.id).length
          const topics = moduleTopics[m.id] || []
          return (
            <div key={m.id} className="module-card" onClick={() => onPickModule(m.id)}>
              <div className="module-card-top">
                <span className="module-dot" style={{ background: m.color }} />
                <span className="module-code">{m.code}</span>
                <span className="module-pct">{Math.round(m.progress * 100)}%</span>
              </div>
              <div className="module-name">{m.name}</div>
              <div className="module-bar">
                <div className="module-bar-fill" style={{ width: `${m.progress * 100}%`, background: m.color }} />
              </div>
              <div className="module-stats">
                <div><span className="muted">terms</span> <strong>{count}</strong></div>
                <div><span className="muted">topics</span> <strong>{topics.length}</strong></div>
                <div><span className="muted">mastered</span> <strong>{Math.round(count * m.progress)}</strong></div>
              </div>
              <div className="module-topics">
                {topics.map(t => <span key={t} className="topic-chip">{t}</span>)}
              </div>
              <button className="module-cta">› start practice</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
