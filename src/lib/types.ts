export type Ring = 'green' | 'yellow' | 'red' | 'orange' | 'blue' | 'indigo' | 'violet'

export type Classification =
  | 'perfect_resonance'
  | 'dual_spectrum'
  | 'spectrum_anomaly'
  | 'pure_signal'
  | 'standard_resonance'

export interface Option {
  text: string
  /** Weight per ring, in RINGS order: green, yellow, red, orange, blue, indigo, violet. */
  weights: number[]
}

export interface Trial {
  title: string
  scenario: string
  question: string
  options: Option[]
  /** Index into `options` once the player has chosen. */
  choice?: number
}

export interface Result {
  primary: Ring
  primary_force: string
  primary_score: number
  secondary: Ring
  secondary_force: string
  secondary_score: number
  archetype: string
  summary: string
  secondary_summary?: string
  evidence: string[]
  identity: string
  spectrum: Record<Ring, number>
  classification: Classification
}

export interface GameState {
  /** 0 = landing/detection, 1..3 = trials, 4 = result */
  stage: 0 | 1 | 2 | 3 | 4
  remainingRings: Ring[]
  trials: Trial[]
  scores: Record<Ring, number>
  result?: Result
}
