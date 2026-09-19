import { RINGS, isRing } from './rings'
import type { FinalResponse, IntermediateResponse, Ring, Trial } from './types'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export class ApiError extends Error {
  readonly code: string
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

interface TrialRequest {
  stage: 1 | 2 | 3
  remaining_rings: Ring[]
  history: { title: string; scenario: string; question: string; answer: string }[]
}

async function post(body: TrialRequest): Promise<unknown> {
  if (!API_URL) throw new ApiError('VITE_API_URL is not configured', 'not_configured')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 75_000)
  try {
    const res = await fetch(`${API_URL}/trial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    if (!res.ok) throw new ApiError(data?.error ?? `HTTP ${res.status}`, data?.error ?? 'http_error')
    return data
  } finally {
    clearTimeout(timer)
  }
}

function toHistory(trials: Trial[]): TrialRequest['history'] {
  return trials.map((t) => ({ title: t.title, scenario: t.scenario, question: t.question, answer: t.answer ?? '' }))
}

function validScores(x: unknown): x is Record<Ring, number> {
  return !!x && typeof x === 'object' && RINGS.every((r) => typeof (x as Record<string, unknown>)[r] === 'number')
}

export async function submitTrial(
  stage: 1 | 2,
  remaining: Ring[],
  trials: Trial[],
): Promise<IntermediateResponse> {
  const data = (await post({ stage, remaining_rings: remaining, history: toHistory(trials) })) as Partial<IntermediateResponse>
  if (!validScores(data.scores)) throw new ApiError('bad scores', 'invalid_response')
  const eliminate = Array.isArray(data.eliminate) ? data.eliminate.filter(isRing) : []
  if (eliminate.length !== 2 || !eliminate.every((r) => remaining.includes(r))) {
    throw new ApiError('bad eliminate', 'invalid_response')
  }
  const nq = data.next_question
  if (!nq || typeof nq.title !== 'string' || typeof nq.scenario !== 'string' || typeof nq.question !== 'string') {
    throw new ApiError('bad next_question', 'invalid_response')
  }
  return { scores: data.scores, eliminate, next_question: nq }
}

export async function submitFinal(remaining: Ring[], trials: Trial[]): Promise<FinalResponse> {
  const data = (await post({ stage: 3, remaining_rings: remaining, history: toHistory(trials) })) as Partial<FinalResponse>
  if (!isRing(data.primary) || !isRing(data.secondary) || data.primary === data.secondary) {
    throw new ApiError('bad rings', 'invalid_response')
  }
  if (!validScores(data.spectrum)) throw new ApiError('bad spectrum', 'invalid_response')
  if (typeof data.archetype !== 'string' || typeof data.summary !== 'string') {
    throw new ApiError('bad text', 'invalid_response')
  }
  return {
    primary: data.primary,
    primary_force: String(data.primary_force ?? ''),
    primary_score: Number(data.primary_score ?? data.spectrum[data.primary]),
    secondary: data.secondary,
    secondary_force: String(data.secondary_force ?? ''),
    secondary_score: Number(data.secondary_score ?? data.spectrum[data.secondary]),
    archetype: data.archetype,
    summary: data.summary,
    secondary_summary: typeof data.secondary_summary === 'string' ? data.secondary_summary : undefined,
    evidence: Array.isArray(data.evidence) ? data.evidence.filter((e) => typeof e === 'string') : [],
    identity: typeof data.identity === 'string' ? data.identity : '',
    spectrum: data.spectrum,
  }
}
