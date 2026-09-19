import Logo from './Logo'
import Ring from './Ring'
import Atmosphere from './Atmosphere'
import { RING_COLOR, RING_FORCE, identityLine } from '../lib/rings'
import type { SharedResult } from '../lib/url'

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function Challenge({ shared, onStart }: { shared: SharedResult; onStart: () => void }) {
  const accent = RING_COLOR[shared.primary]
  const accent2 = RING_COLOR[shared.secondary]
  const who = shared.name ? shared.name.toUpperCase() : 'SOMEONE'
  const line = identityLine(shared.primary, shared.secondary)
  const pretty = line.charAt(0) + line.slice(1).toLowerCase()
  return (
    <>
      <Atmosphere rings={[shared.primary, shared.secondary]} intensity={3} dominant={shared.primary} secondary={shared.secondary} />
      <main className="screen" style={{ '--accent': accent } as React.CSSProperties}>
        <Logo accent={shared.primary} />
        <div style={{ height: 32 }} />
        <p className="challenge__name">{who} was chosen by</p>
        <div className="challenge__rings">
          <Ring ring={shared.primary} size={110} state="breathe" />
          <Ring ring={shared.secondary} size={64} />
        </div>
        <h1 className="challenge__combo">
          <span style={{ color: accent, textShadow: `0 0 30px ${accent}` }}>{shared.primary.toUpperCase()}</span>
          <span className="muted" style={{ margin: '0 12px' }}>
            ×
          </span>
          <span style={{ color: accent2, textShadow: `0 0 20px ${accent2}` }}>{shared.secondary.toUpperCase()}</span>
        </h1>
        <p className="body body--secondary" style={{ marginTop: 12, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
          {pretty}
        </p>
        <p className="small" style={{ marginTop: 6 }}>
          {cap(RING_FORCE[shared.primary])} {shared.p}% · {cap(RING_FORCE[shared.secondary])} {shared.s}%
        </p>
        <h2 className="headline headline--lg" style={{ margin: '36px 0 24px' }}>
          Will your ring match?
        </h2>
        <div className="btn-row">
          <button className="btn btn--primary" onClick={onStart}>
            Take the trial
          </button>
        </div>
      </main>
    </>
  )
}
