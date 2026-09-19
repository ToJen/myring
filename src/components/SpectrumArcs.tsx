import { useEffect, useState } from 'react'
import { RING_COLOR, RING_FORCE, RINGS } from '../lib/rings'
import type { Ring } from '../lib/types'

interface Props {
  spectrum: Record<Ring, number>
  primary: Ring
  secondary: Ring
}

const SIZE = 200
const CENTER = SIZE / 2
const STROKE = 9
const GAP = 3
const START_R = 26

export default function SpectrumArcs({ spectrum, primary, secondary }: Props) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const ordered = [...RINGS].sort((a, b) => spectrum[b] - spectrum[a])

  return (
    <div className="spectrum">
      <svg className="spectrum__svg" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Spectrum fingerprint">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {ordered.map((r, i) => {
          const radius = START_R + i * (STROKE + GAP)
          const circ = 2 * Math.PI * radius
          const pct = animated ? Math.max(0, Math.min(100, spectrum[r])) / 100 : 0
          const emphasized = r === primary || r === secondary
          return (
            <g key={r} transform={`rotate(-90 ${CENTER} ${CENTER})`}>
              <circle cx={CENTER} cy={CENTER} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE} />
              <circle
                cx={CENTER}
                cy={CENTER}
                r={radius}
                fill="none"
                stroke={RING_COLOR[r]}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${circ * pct} ${circ}`}
                opacity={emphasized ? 1 : 0.45}
                filter={emphasized ? 'url(#glow)' : undefined}
                style={{ transition: `stroke-dasharray 1.4s cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 0.12}s` }}
              />
            </g>
          )
        })}
      </svg>
      <div className="spectrum__legend">
        {ordered.map((r) => (
          <div className="spectrum__row" key={r} style={{ color: RING_COLOR[r], opacity: r === primary || r === secondary ? 1 : 0.6 }}>
            <span className="spectrum__dot" />
            <span style={{ color: '#d0d0d0', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 11 }}>
              {RING_FORCE[r]}
            </span>
            <span className="spectrum__val" style={{ color: '#f5f5f5' }}>
              {Math.round(spectrum[r])}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
