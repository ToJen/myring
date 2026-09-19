import { classify } from './classify'
import { RING_FORCE, ZERO_SCORES, identityLine, isRing } from './rings'
import type { Result, Ring } from './types'

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export interface SharedResult {
  primary: Ring
  secondary: Ring
  p: number
  s: number
  archetype?: string
  name?: string
  challenge: boolean
}

export function encodeResult(result: Result, opts: { challenge?: boolean; name?: string } = {}): string {
  const params = new URLSearchParams({
    primary: result.primary,
    secondary: result.secondary,
    p: String(result.primary_score),
    s: String(result.secondary_score),
  })
  if (result.archetype) params.set('a', result.archetype)
  if (opts.name) params.set('n', opts.name.slice(0, 32))
  const route = opts.challenge ? 'challenge' : 'result'
  return `${window.location.origin}${BASE}/#/${route}?${params.toString()}`
}

export function parseHash(hash: string): { route: string; params: URLSearchParams } {
  const h = hash.replace(/^#\/?/, '')
  const [route, query = ''] = h.split('?')
  return { route: route.replace(/\/$/, ''), params: new URLSearchParams(query) }
}

export function decodeShared(params: URLSearchParams, challenge: boolean): SharedResult | null {
  const primary = params.get('primary')
  const secondary = params.get('secondary')
  const p = Number(params.get('p'))
  const s = Number(params.get('s'))
  if (!isRing(primary) || !isRing(secondary) || primary === secondary) return null
  if (!Number.isFinite(p) || !Number.isFinite(s)) return null
  return {
    primary,
    secondary,
    p: Math.max(0, Math.min(100, Math.round(p))),
    s: Math.max(0, Math.min(100, Math.round(s))),
    archetype: params.get('a')?.slice(0, 60) || undefined,
    name: params.get('n')?.slice(0, 32) || undefined,
    challenge,
  }
}

/** Rebuilds a minimal Result from URL data so the result page can render without answers. */
export function sharedToResult(shared: SharedResult): Result {
  const spectrum: Record<Ring, number> = { ...ZERO_SCORES }
  spectrum[shared.primary] = shared.p
  spectrum[shared.secondary] = shared.s
  return {
    primary: shared.primary,
    primary_force: RING_FORCE[shared.primary],
    primary_score: shared.p,
    secondary: shared.secondary,
    secondary_force: RING_FORCE[shared.secondary],
    secondary_score: shared.s,
    archetype: shared.archetype ?? '',
    summary: '',
    evidence: [],
    identity: identityLine(shared.primary, shared.secondary),
    spectrum,
    classification: classify(spectrum, shared.primary, shared.secondary),
  }
}
