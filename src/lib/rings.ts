import type { Ring } from './types'

export const RINGS: Ring[] = ['green', 'yellow', 'red', 'orange', 'blue', 'indigo', 'violet']

export const RING_COLOR: Record<Ring, string> = {
  green: '#16FF63',
  yellow: '#FFD900',
  red: '#FF2438',
  orange: '#FF7A00',
  blue: '#168BFF',
  indigo: '#6945FF',
  violet: '#FF3BA7',
}

export const RING_FORCE: Record<Ring, string> = {
  green: 'will',
  yellow: 'fear',
  red: 'rage',
  orange: 'avarice',
  blue: 'hope',
  indigo: 'compassion',
  violet: 'love',
}

export function isRing(x: unknown): x is Ring {
  return typeof x === 'string' && (RINGS as string[]).includes(x)
}

export const ZERO_SCORES: Record<Ring, number> = {
  green: 0,
  yellow: 0,
  red: 0,
  orange: 0,
  blue: 0,
  indigo: 0,
  violet: 0,
}

/** Default connecting phrases for the 21 primary × secondary combinations. */
const CONNECTOR: Partial<Record<Ring, string>> = {
  green: 'POWERED BY',
  yellow: 'GUARDED BY',
  red: 'SHARPENED BY',
  orange: 'DRIVEN BY',
  blue: 'CARRIED BY',
  indigo: 'DEEPENED BY',
  violet: 'BOUND BY',
}

export function identityLine(primary: Ring, secondary: Ring): string {
  return `${RING_FORCE[primary].toUpperCase()} ${CONNECTOR[secondary] ?? 'POWERED BY'} ${RING_FORCE[secondary].toUpperCase()}`
}
