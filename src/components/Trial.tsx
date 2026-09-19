import { useEffect, useState } from 'react'
import RingField from './RingField'
import Ring from './Ring'
import { RING_COLOR } from '../lib/rings'
import type { Ring as RingId, Trial as TrialT } from '../lib/types'

export const MAX_ANSWER = 600

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
  status: 'idle' | 'loading' | 'error'
  initialAnswer: string
  onSubmit: (answer: string) => void
}

export default function Trial({ stage, trial, remaining, status, initialAnswer, onSubmit }: Props) {
  const [answer, setAnswer] = useState(initialAnswer)
  const [loadIdx, setLoadIdx] = useState(0)
  const trimmed = answer.trim()
  const theme = trial.title.split('·')[1]?.trim() ?? ''

  const copy = LOADING_COPY[stage]
  useEffect(() => {
    if (status !== 'loading') return
    const t = setInterval(() => setLoadIdx((i) => Math.min(i + 1, copy.length - 1)), 1800)
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

        {status === 'error' && (
          <div className="error">
            <span className="kicker" style={{ color: 'var(--red)' }}>
              The signal was interrupted.
            </span>
            <p className="body body--secondary" style={{ margin: 0 }}>
              The ring couldn't read your response.
            </p>
          </div>
        )}

        <textarea
          className="trial__textarea"
          placeholder="What would you actually do?"
          maxLength={MAX_ANSWER}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          aria-label="Your answer"
        />
        <div className="trial__meta">
          <span>Answer honestly. Nothing is stored.</span>
          <span>
            {answer.length}/{MAX_ANSWER}
          </span>
        </div>
        <div className="trial__actions">
          <button className="btn btn--primary" disabled={!trimmed} onClick={() => onSubmit(trimmed)}>
            {status === 'error' ? '[ Try again ]' : stage === 3 ? 'Submit final answer' : 'Submit'}
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
