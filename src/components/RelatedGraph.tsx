import { useData } from '../context/data'
import type { Term } from '../types'

interface RelatedGraphProps {
  term: Term
  onPick?: (id: string) => void
}

export function RelatedGraph({ term, onPick }: RelatedGraphProps) {
  const { byId } = useData()
  const related = (term.related || []).map(id => byId[id]).filter(Boolean)
  const W = 560, H = 260, cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.36

  const nodes = related.map((r, i) => {
    const a = (-Math.PI / 2) + (i * 2 * Math.PI) / Math.max(related.length, 1)
    return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, r }
  })

  return (
    <div className="graph-wrap">
      <div className="graph-header">
        <span className="graph-label">// related_nodes</span>
        <span className="graph-count">{related.length} edges</span>
      </div>
      <svg className="graph-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(120,140,130,0.06)" strokeWidth="1" />
          </pattern>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />
        <circle cx={cx} cy={cy} r={70} fill="url(#centerGlow)" />

        {nodes.map((n, i) => (
          <g key={`e-${i}`}>
            <line x1={cx} y1={cy} x2={n.x} y2={n.y} stroke="var(--accent)" strokeOpacity="0.35" strokeDasharray="2 3" strokeWidth="1" />
            <circle cx={(cx + n.x) / 2} cy={(cy + n.y) / 2} r="1.5" fill="var(--accent)" />
          </g>
        ))}

        <g>
          <circle cx={cx} cy={cy} r={32} fill="var(--bg-2)" stroke="var(--accent)" strokeWidth="1.5" />
          <text x={cx} y={cy + 4} textAnchor="middle" fontFamily="var(--mono)" fontSize="13" fontWeight="600" fill="var(--accent)">
            {term.term}
          </text>
        </g>

        {nodes.map((n, i) => (
          <g key={`n-${i}`} className="graph-node" onClick={() => onPick?.(n.r.id)} style={{ cursor: onPick ? 'pointer' : 'default' }}>
            <rect x={n.x - 38} y={n.y - 12} width="76" height="24" rx="3" ry="3" fill="var(--bg-2)" stroke="var(--border)" strokeWidth="1" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontFamily="var(--mono)" fontSize="11" fontWeight="500" fill="var(--fg)">
              {n.r.term}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
