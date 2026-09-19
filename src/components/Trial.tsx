import { useEffect, useState } from 'react'
import RingField from './RingField'
import Ring from './Ring'
import { RING_COLOR } from '../lib/rings'
import type { Ring as RingId, Trial as TrialT } from '../lib/types'

const NUMERALS = ['I', 'II', 'III']

const LOADING_COPY: Record<1 | 2 | 3, string[]> = {
  1: ['Analyzing response...', 'Reading your signal...', 'The spectrum is shifting...'],
  2: ['Analyzing response...', 'The spectrum is shifting...', 'Rings are losing interest...'],
  3: ['Final analysis', 'Final signal detected...'],
}

interface Props {
  stage: 1 | 2 | 3
  trial: TrialT
  remaining: RingId[]
  status: 'idle' | 'loading'
  onSubmit: (choice: number) => void
}

export default function Trial({ stage, trial, remaining, status, onSubmit }: Props) {
  const [choice, setChoice] = useState<number | null>(null)
  const [loadIdx, setLoadIdx] = useState(0)
  const theme = trial.title.split('·')[1]?.trim() ?? ''

  const copy = LOADING_COPY[stage]
  useEffect(() => {
    if (status !== 'loading') return
    const t = setInterval(() => setLoadIdx((i) => Math.min(i + 1, copy.length - 1)), 1500)
    return () => clearInterval(t)
  }, [status, copy.length])

  if (status === 'loading') {
    return (
      <main className="screen">
        <div className="status">
          <RingField remaining={remaining} mode="analyzing" size={stage === 3 ? 80 : stage === 2 ? 64 : 44} labels={stage < 3} />
          <span className="status__text" key={loadIdx}>
            {copy[loadIdx]}
          </span>
        </div>
      </main>
    )
  }

  return (
    <main className="screen screen--top">
      {stage === 3 && (
        <div className="trial__bg-rings" aria-hidden="true">
          {remaining.map((r, i) => (
            <span key={r} className="trial__bg-ring" style={{ color: RING_COLOR[r], animationDelay: `${i * 0.8}s` }} />
          ))}
        </div>
      )}
      <div className="trial">
        {stage < 3 && (
          <div style={{ marginBottom: 4 }}>
            <RingField remaining={remaining} mode={stage === 1 ? 'dim' : 'idle'} size={stage === 1 ? 22 : 34} labels={false} />
          </div>
        )}
        <div className="trial__header">
          <h1 className="trial__num">
            <span className="muted" style={{ fontSize: '0.3em', letterSpacing: '0.3em', display: 'block', marginBottom: 6 }}>
              TRIAL
            </span>
            {NUMERALS[stage - 1]}
          </h1>
          {theme && <span className="trial__theme">{theme}</span>}
        </div>
        <p className="trial__scenario">{trial.scenario}</p>
        <h2 className="trial__question">{trial.question}</h2>

        <div className="options" role="radiogroup" aria-label="Your answer">
          {trial.options.map((o, i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={choice === i}
              className={`option${choice === i ? ' option--selected' : ''}`}
              onClick={() => setChoice(i)}
            >
              <span className="option__index">{String.fromCharCode(65 + i)}</span>
              <span className="option__text">{o.text}</span>
            </button>
          ))}
        </div>
        <div className="trial__meta">
          <span>Answer honestly. Nothing is stored.</span>
        </div>
        <div className="trial__actions">
          <button className="btn btn--primary" disabled={choice === null} onClick={() => choice !== null && onSubmit(choice)}>
            {stage === 3 ? 'Submit final answer' : 'Submit'}
          </button>
        </div>
        {stage === 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 8 }}>
            {remaining.map((r) => (
              <Ring key={r} ring={r} size={16} state="breathe" />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
