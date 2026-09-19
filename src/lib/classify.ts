import type { Classification, Ring } from './types'

export function classify(spectrum: Record<Ring, number>, primary: Ring, secondary: Ring): Classification {
  const p = spectrum[primary]
  const s = spectrum[secondary]
  const sorted = Object.values(spectrum).sort((a, b) => b - a)
  const top3Spread = sorted[0] - sorted[2]
  if (p >= 90 && p - s >= 20) return 'perfect_resonance'
  if (p - s <= 5) return 'dual_spectrum'
  if (top3Spread <= 8) return 'spectrum_anomaly'
  if (p - s >= 35) return 'pure_signal'
  return 'standard_resonance'
}

export const CLASSIFICATION_LABEL: Record<Classification, string> = {
  perfect_resonance: 'PERFECT RESONANCE',
  dual_spectrum: 'DUAL SPECTRUM',
  spectrum_anomaly: 'SPECTRUM ANOMALY',
  pure_signal: 'PURE SIGNAL',
  standard_resonance: 'STANDARD RESONANCE',
}

export const CLASSIFICATION_NOTE: Record<Classification, string> = {
  perfect_resonance: 'A dominant signal with unusually little interference.',
  dual_spectrum: 'Two forces hold you in near-equal measure.',
  spectrum_anomaly: 'Three signals within a hair of each other. This is rare.',
  pure_signal: 'One force, far ahead of everything else.',
  standard_resonance: 'A clear primary with a supporting secondary.',
}
