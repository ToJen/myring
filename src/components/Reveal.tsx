import { useEffect, useState } from 'react'
import Ring from './Ring'
import { RING_COLOR, RING_FORCE } from '../lib/rings'
import type { Result, Ring as RingId } from '../lib/types'

interface Props {
  result: Result
  finalists: RingId[]
  onDone: () => void
}

export default function Reveal({ result, finalists, onDone }: Props) {
  const [phase, setPhase] = useState(0)
  const losers = finalists.filter((r) => r !== result.primary)
  const accent = RING_COLOR[result.primary]

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 1400), // first loser fades
      setTimeout(() => setPhase(2), 3000), // second loser fades
      setTimeout(() => setPhase(3), 4400), // black + "A RING HAS CHOSEN YOU."
      setTimeout(() => setPhase(4), 6200), // flood + ring
      setTimeout(() => setPhase(5), 7600), // color / force / pct
      setTimeout(() => setPhase(6), 9000), // archetype
      setTimeout(onDone, 11600),
    ]
    return () => t.forEach(clearTimeout)
  }, [onDone])

  if (phase < 3) {
    return (
      <main className="screen">
        <div className="status">
          <span className="kicker kicker--glow">Final analysis</span>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {finalists.map((r) => {
              const loserIdx = losers.indexOf(r)
              const gone = loserIdx >= 0 && phase > loserIdx
              return <Ring key={r} ring={r} size={84} state={gone ? 'gone' : 'breathe'} style={{ transitionDuration: '1.2s' }} />
            })}
          </div>
          <span className="status__text">{phase === 2 ? 'One signal remains' : ' '}</span>
        </div>
      </main>
    )
  }

  return (
    <main className="reveal" style={{ '--accent': accent } as React.CSSProperties} onClick={phase >= 6 ? onDone : undefined}>
      {phase >= 4 && <div className="reveal__flood" />}
      <p className="kicker kicker--glow reveal__step" style={{ animationDelay: '0.2s' }}>
        A ring has chosen you.
      </p>
      {phase >= 4 && <div className="reveal__ring" style={{ color: accent }} />}
      {phase >= 5 && (
        <div className="reveal__step" style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          <p className="reveal__force" style={{ color: accent, textShadow: `0 0 30px ${accent}` }}>
            {result.primary.toUpperCase()}
          </p>
          <p className="reveal__force" style={{ fontSize: 'clamp(28px, 9vw, 44px)' }}>
            {RING_FORCE[result.primary].toUpperCase()}
          </p>
          <span className="giant" style={{ fontSize: 'clamp(64px, 22vw, 120px)' }}>
            {result.primary_score}%
          </span>
        </div>
      )}
      {phase >= 6 && (
        <p className="reveal__archetype reveal__step">{result.archetype.toUpperCase()}</p>
      )}
      {phase >= 6 && (
        <span className="small reveal__step" style={{ animationDelay: '1.2s' }}>
          Tap to continue
        </span>
      )}
    </main>
  )
}
