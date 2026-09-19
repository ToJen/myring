import { useState } from 'react'
import Logo from './Logo'
import Ring from './Ring'
import SpectrumArcs from './SpectrumArcs'
import { CLASSIFICATION_LABEL, CLASSIFICATION_NOTE } from '../lib/classify'
import { RING_COLOR, RING_FORCE } from '../lib/rings'
import { challengeText, share, shareText } from '../lib/share'
import { encodeResult } from '../lib/url'
import type { Result as ResultT } from '../lib/types'

interface Props {
  result: ResultT
  /** true when rendered from a shared URL (no summary/evidence available) */
  shared?: boolean
  onRestart: () => void
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function Result({ result, shared = false, onRestart }: Props) {
  const [toast, setToast] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [showName, setShowName] = useState(false)
  const accent = RING_COLOR[result.primary]
  const accent2 = RING_COLOR[result.secondary]
  const dual = result.classification === 'dual_spectrum'

  function flash(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  async function onShare() {
    const r = await share(shareText(result), encodeResult(result))
    if (r === 'copied') flash('Link copied')
    else if (r === 'failed') flash('Could not share')
  }

  async function onChallenge() {
    if (!showName) {
      setShowName(true)
      return
    }
    const r = await share(challengeText(result), encodeResult(result, { challenge: true, name: name.trim() || undefined }))
    if (r === 'copied') flash('Challenge link copied')
    else if (r === 'failed') flash('Could not share')
  }

  return (
    <main className="screen screen--top" style={{ '--accent': accent, '--accent2': accent2 } as React.CSSProperties}>
      <div className="topbar" style={{ padding: '0 0 20px' }}>
        <Logo accent={result.primary} />
        <span className="badge">{CLASSIFICATION_LABEL[result.classification]}</span>
      </div>
      <div className="result">
        <section className="card">
          <div className="card__top">
            <div className="card__rings">
              <Ring ring={result.primary} size={44} state="breathe" className="card__ring" />
              <Ring ring={result.secondary} size={28} className="card__ring card__ring--secondary" />
            </div>
            <span className="small">MyRing</span>
          </div>
          <div>
            <h1 className="card__combo">
              <span style={{ color: accent, textShadow: `0 0 26px ${accent}` }}>{result.primary.toUpperCase()}</span>
              <span className="muted" style={{ margin: '0 10px' }}>
                ×
              </span>
              <span style={{ color: accent2, textShadow: `0 0 20px ${accent2}` }}>{result.secondary.toUpperCase()}</span>
            </h1>
            <div className="card__identity" style={{ marginTop: 10 }}>
              {result.identity || `${RING_FORCE[result.primary]} powered by ${RING_FORCE[result.secondary]}`}
            </div>
          </div>
          {result.archetype && <h2 className="card__archetype">{result.archetype.toUpperCase()}</h2>}
          <div className="card__scores">
            <div className="score">
              <span className="score__num" style={{ color: accent }}>
                {result.primary_score}
                {dual && <span className="muted"> / {result.secondary_score}</span>}
              </span>
              <span className="score__label">
                {RING_FORCE[result.primary]}
                {dual && ` / ${RING_FORCE[result.secondary]}`}
              </span>
            </div>
            {!dual && (
              <div className="score">
                <span className="score__num" style={{ color: accent2, fontSize: 'clamp(28px, 8vw, 36px)', marginTop: 8 }}>
                  {result.secondary_score}
                </span>
                <span className="score__label">{RING_FORCE[result.secondary]}</span>
              </div>
            )}
          </div>
          <span className="small">{CLASSIFICATION_NOTE[result.classification]}</span>
        </section>

        {result.summary && (
          <section className="section">
            <h3 className="section__title">Reading</h3>
            <p className="body">{result.summary}</p>
          </section>
        )}

        <section className="section secondary-signal">
          <p className="secondary-signal__label">
            Secondary signal: {result.secondary.toUpperCase()} · {RING_FORCE[result.secondary].toUpperCase()} · {result.secondary_score}%
          </p>
          <p className="body body--secondary" style={{ fontSize: 15 }}>
            {result.secondary_summary ||
              `${cap(RING_FORCE[result.secondary])} runs underneath your ${RING_FORCE[result.primary]}, shaping how it shows up.`}
          </p>
        </section>

        {result.evidence.length > 0 && (
          <section className="section">
            <h3 className="section__title">Evidence</h3>
            <ul className="evidence">
              {result.evidence.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="section">
          <h3 className="section__title">Spectrum fingerprint</h3>
          <SpectrumArcs spectrum={result.spectrum} primary={result.primary} secondary={result.secondary} />
          {shared && <span className="small">Only the two strongest signals travel with a shared link.</span>}
        </section>

        <section className="btn-row" style={{ marginTop: 8 }}>
          <button className="btn btn--primary" onClick={onShare}>
            Share my ring
          </button>
          {showName && (
            <input
              className="name-input fade-in"
              placeholder="Your name (optional)"
              maxLength={32}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Your name for the challenge"
            />
          )}
          <button className="btn btn--ghost" onClick={onChallenge}>
            {showName ? 'Send challenge' : 'Challenge a friend'}
          </button>
          <button className="btn btn--ghost" onClick={onRestart} style={{ opacity: 0.7 }}>
            {shared ? 'Take the trial' : 'Run it again'}
          </button>
        </section>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </main>
  )
}
