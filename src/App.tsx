import { useCallback, useEffect, useReducer, useState } from 'react'
import Atmosphere from './components/Atmosphere'
import Challenge from './components/Challenge'
import Detection from './components/Detection'
import Elimination from './components/Elimination'
import Footer from './components/Footer'
import Landing from './components/Landing'
import Result from './components/Result'
import Reveal from './components/Reveal'
import Trial from './components/Trial'
import { eliminate, finalResult, nextTrial, openingTrial, tally } from './lib/engine'
import { RINGS, ZERO_SCORES } from './lib/rings'
import type { GameState, Ring, Trial as TrialT } from './lib/types'
import { decodeShared, parseHash, sharedToResult } from './lib/url'

type Phase = 'landing' | 'detection' | 'trial' | 'eliminating' | 'revealing' | 'result'

interface UiState extends GameState {
  phase: Phase
  status: 'idle' | 'loading'
  pendingEliminate: Ring[]
  finalists: Ring[]
}

type Action =
  | { type: 'start' }
  | { type: 'detected'; trial: TrialT }
  | { type: 'submit'; choice: number }
  | { type: 'intermediate'; scores: Record<Ring, number>; eliminate: Ring[]; next: TrialT }
  | { type: 'eliminated' }
  | { type: 'final'; result: NonNullable<GameState['result']> }
  | { type: 'revealed' }
  | { type: 'reset' }

const initial: UiState = {
  phase: 'landing',
  stage: 0,
  remainingRings: RINGS,
  trials: [],
  scores: ZERO_SCORES,
  status: 'idle',
  pendingEliminate: [],
  finalists: [],
}

function reducer(s: UiState, a: Action): UiState {
  switch (a.type) {
    case 'start':
      return { ...initial, phase: 'detection' }
    case 'detected':
      return { ...s, phase: 'trial', stage: 1, trials: [a.trial], status: 'idle' }
    case 'submit': {
      const trials = s.trials.slice()
      trials[trials.length - 1] = { ...trials[trials.length - 1], choice: a.choice }
      return { ...s, trials, status: 'loading' }
    }
    case 'intermediate':
      return {
        ...s,
        scores: a.scores,
        pendingEliminate: a.eliminate,
        trials: [...s.trials, a.next],
        phase: 'eliminating',
        status: 'idle',
      }
    case 'eliminated':
      return {
        ...s,
        remainingRings: s.remainingRings.filter((r) => !s.pendingEliminate.includes(r)),
        pendingEliminate: [],
        stage: (s.stage + 1) as 2 | 3,
        phase: 'trial',
      }
    case 'final':
      return {
        ...s,
        result: a.result,
        scores: a.result.spectrum,
        finalists: s.remainingRings,
        remainingRings: [a.result.primary],
        stage: 4,
        phase: 'revealing',
        status: 'idle',
      }
    case 'revealed':
      return { ...s, phase: 'result' }
    case 'reset':
      return initial
  }
}

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const fn = () => setHash(window.location.hash)
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])
  return hash
}

export default function App() {
  const hash = useHash()
  const [s, dispatch] = useReducer(reducer, initial)
  const { route, params } = parseHash(hash)

  const goHome = useCallback(() => {
    dispatch({ type: 'reset' })
    window.location.hash = '#/'
  }, [])

  const startGame = useCallback(() => {
    if (window.location.hash && window.location.hash !== '#/') window.location.hash = '#/'
    dispatch({ type: 'start' })
  }, [])

  const onDetected = useCallback(() => dispatch({ type: 'detected', trial: openingTrial() }), [])
  const onEliminated = useCallback(() => dispatch({ type: 'eliminated' }), [])
  const onRevealed = useCallback(() => dispatch({ type: 'revealed' }), [])

  function onSubmit(choice: number) {
    dispatch({ type: 'submit', choice })
    const trials = s.trials.slice()
    trials[trials.length - 1] = { ...trials[trials.length - 1], choice }
    const stage = s.stage
    const remaining = s.remainingRings
    // A short pause so the "analyzing" moment lands before the spectrum shifts.
    const delay = stage === 3 ? 3400 : 2600
    window.setTimeout(() => {
      if (stage === 1 || stage === 2) {
        const out = eliminate(trials, remaining)
        const left = remaining.filter((r) => !out.includes(r))
        dispatch({ type: 'intermediate', scores: tally(trials), eliminate: out, next: nextTrial(stage === 1 ? 2 : 3, left) })
      } else if (stage === 3) {
        dispatch({ type: 'final', result: finalResult(trials) })
      }
    }, delay)
  }

  // Shared routes
  if (route === 'result' || route === 'challenge') {
    const shared = decodeShared(params, route === 'challenge')
    if (shared) {
      if (route === 'challenge') {
        return (
          <div className="app">
            <Challenge shared={shared} onStart={startGame} />
            <Footer />
          </div>
        )
      }
      const result = sharedToResult(shared)
      return (
        <div className="app">
          <Atmosphere rings={[result.primary, result.secondary]} intensity={3} dominant={result.primary} secondary={result.secondary} />
          <Result result={result} shared onRestart={startGame} />
          <Footer />
        </div>
      )
    }
  }

  let screen: React.ReactNode
  let atmosphere: React.ReactNode
  const currentTrial = s.trials[s.trials.length - 1]

  switch (s.phase) {
    case 'landing':
      atmosphere = <Atmosphere rings={RINGS} intensity={0} />
      screen = <Landing onStart={startGame} />
      break
    case 'detection':
      atmosphere = <Atmosphere rings={RINGS} intensity={1} />
      screen = <Detection onDone={onDetected} />
      break
    case 'trial':
      atmosphere = <Atmosphere rings={s.remainingRings} intensity={s.stage === 1 ? 1 : s.stage === 2 ? 2 : 3} />
      screen = (
        <Trial
          key={`${s.stage}-${s.status === 'loading'}`}
          stage={s.stage as 1 | 2 | 3}
          trial={currentTrial}
          remaining={s.remainingRings}
          status={s.status}
          onSubmit={onSubmit}
        />
      )
      break
    case 'eliminating':
      atmosphere = <Atmosphere rings={s.remainingRings.filter((r) => !s.pendingEliminate.includes(r))} intensity={s.stage === 1 ? 2 : 3} />
      screen = <Elimination stage={s.stage as 1 | 2} before={s.remainingRings} eliminated={s.pendingEliminate} onDone={onEliminated} />
      break
    case 'revealing':
      atmosphere = <Atmosphere rings={s.finalists} intensity={3} dominant={s.result!.primary} secondary={s.result!.secondary} />
      screen = <Reveal result={s.result!} finalists={s.finalists} onDone={onRevealed} />
      break
    case 'result':
      atmosphere = <Atmosphere rings={[s.result!.primary, s.result!.secondary]} intensity={3} dominant={s.result!.primary} secondary={s.result!.secondary} />
      screen = <Result result={s.result!} onRestart={goHome} />
      break
  }

  return (
    <div className="app">
      {atmosphere}
      {screen}
      <Footer />
    </div>
  )
}
