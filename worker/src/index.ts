import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from './prompt'

export interface Env {
  ANTHROPIC_API_KEY: string
  ALLOWED_ORIGINS: string
  MODEL?: string
}

const RINGS = ['green', 'yellow', 'red', 'orange', 'blue', 'indigo', 'violet'] as const
type Ring = (typeof RINGS)[number]

const FORCES: Record<Ring, string> = {
  green: 'will',
  yellow: 'fear',
  red: 'rage',
  orange: 'avarice',
  blue: 'hope',
  indigo: 'compassion',
  violet: 'love',
}

interface HistoryItem {
  title?: string
  scenario?: string
  question: string
  answer: string
}

interface TrialRequest {
  stage: 1 | 2 | 3
  remaining_rings: Ring[]
  history: HistoryItem[]
}

const MAX_ANSWER = 700
const MAX_QUESTION = 1200

// ---------- JSON schemas sent to the model (output_config.format) ----------

const scoresSchema = {
  type: 'object',
  properties: Object.fromEntries(RINGS.map((r) => [r, { type: 'number', minimum: 0, maximum: 1 }])),
  required: [...RINGS],
  additionalProperties: false,
}

const intermediateSchema = {
  type: 'object',
  properties: {
    scores: scoresSchema,
    eliminate: { type: 'array', items: { type: 'string', enum: [...RINGS] } },
    next_question: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        scenario: { type: 'string' },
        question: { type: 'string' },
      },
      required: ['title', 'scenario', 'question'],
      additionalProperties: false,
    },
    rationale: { type: 'string' },
  },
  required: ['scores', 'eliminate', 'next_question', 'rationale'],
  additionalProperties: false,
}

const finalSchema = {
  type: 'object',
  properties: {
    scores: scoresSchema,
    primary: { type: 'string', enum: [...RINGS] },
    secondary: { type: 'string', enum: [...RINGS] },
    archetype: { type: 'string' },
    summary: { type: 'string' },
    secondary_summary: { type: 'string' },
    evidence: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
    identity: { type: 'string' },
  },
  required: ['scores', 'primary', 'secondary', 'archetype', 'summary', 'secondary_summary', 'evidence', 'identity'],
  additionalProperties: false,
}

// ---------- helpers ----------

function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  const allow = origin && allowed.includes(origin) ? origin : allowed[0] ?? ''
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  })
}

function isRing(x: unknown): x is Ring {
  return typeof x === 'string' && (RINGS as readonly string[]).includes(x)
}

function parseRequest(body: unknown): TrialRequest | string {
  if (!body || typeof body !== 'object') return 'Body must be an object'
  const b = body as Record<string, unknown>
  const stage = b.stage
  if (stage !== 1 && stage !== 2 && stage !== 3) return 'stage must be 1, 2 or 3'
  if (!Array.isArray(b.remaining_rings) || !b.remaining_rings.every(isRing)) return 'remaining_rings invalid'
  const remaining = [...new Set(b.remaining_rings as Ring[])]
  const expectedRemaining = { 1: 7, 2: 5, 3: 3 }[stage]
  if (remaining.length !== expectedRemaining) return `stage ${stage} expects ${expectedRemaining} remaining rings`
  if (!Array.isArray(b.history) || b.history.length !== stage) return `history must contain ${stage} entries`
  const history: HistoryItem[] = []
  for (const h of b.history as unknown[]) {
    if (!h || typeof h !== 'object') return 'history entry invalid'
    const item = h as Record<string, unknown>
    if (typeof item.question !== 'string' || typeof item.answer !== 'string') return 'history entry invalid'
    const answer = item.answer.trim()
    if (!answer) return 'answers must not be empty'
    history.push({
      title: typeof item.title === 'string' ? item.title.slice(0, 80) : undefined,
      scenario: typeof item.scenario === 'string' ? item.scenario.slice(0, MAX_QUESTION) : undefined,
      question: item.question.slice(0, MAX_QUESTION),
      answer: answer.slice(0, MAX_ANSWER),
    })
  }
  return { stage, remaining_rings: remaining, history }
}

function buildUserMessage(req: TrialRequest): string {
  const eliminated = RINGS.filter((r) => !req.remaining_rings.includes(r))
  const lines: string[] = []
  lines.push(`Stage: the user has just completed Trial ${req.stage} of 3.`)
  lines.push(`Remaining rings: ${req.remaining_rings.map((r) => `${r} (${FORCES[r]})`).join(', ')}.`)
  if (eliminated.length) lines.push(`Already eliminated: ${eliminated.join(', ')}.`)
  lines.push('')
  req.history.forEach((h, i) => {
    lines.push(`--- Trial ${i + 1}${h.title ? ` (${h.title})` : ''} ---`)
    if (h.scenario) lines.push(`Scenario: ${h.scenario}`)
    lines.push(`Question: ${h.question}`)
    lines.push(`User answer: """${h.answer}"""`)
    lines.push('')
  })
  if (req.stage === 1) {
    lines.push('Task: score all seven forces, eliminate exactly 2 of the remaining rings (the weakest), and generate Trial II (title "TRIAL II · <THEME>") that distinguishes among the strongest remaining candidates using the user\'s answer.')
  } else if (req.stage === 2) {
    lines.push('Task: update all seven scores, eliminate exactly 2 of the remaining rings (the weakest), and generate Trial III (title "TRIAL III · <THEME>") as a pointed dilemma that discriminates among the final three rings, clearly built on what the user has said.')
  } else {
    lines.push('Task: produce the final assessment. primary and secondary must both be among the remaining rings and must differ. Scores must be consistent with the ranking (primary highest, secondary second).')
  }
  return lines.join('\n')
}

function normalizeScores(raw: Record<string, unknown>): Record<Ring, number> {
  const out = {} as Record<Ring, number>
  for (const r of RINGS) {
    const v = Number(raw[r])
    out[r] = Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0
  }
  return out
}

function validateIntermediate(req: TrialRequest, data: unknown): Record<string, unknown> | string {
  if (!data || typeof data !== 'object') return 'no data'
  const d = data as Record<string, unknown>
  if (!d.scores || typeof d.scores !== 'object') return 'scores missing'
  const scores = normalizeScores(d.scores as Record<string, unknown>)
  let eliminate = Array.isArray(d.eliminate) ? (d.eliminate.filter(isRing) as Ring[]) : []
  eliminate = [...new Set(eliminate)].filter((r) => req.remaining_rings.includes(r))
  if (eliminate.length !== 2) {
    // Fall back to the two lowest-scoring remaining rings.
    eliminate = [...req.remaining_rings].sort((a, b) => scores[a] - scores[b]).slice(0, 2)
  }
  const nq = d.next_question as Record<string, unknown> | undefined
  if (!nq || typeof nq.title !== 'string' || typeof nq.scenario !== 'string' || typeof nq.question !== 'string') {
    return 'next_question missing'
  }
  if (!nq.scenario.trim() || !nq.question.trim()) return 'next_question empty'
  const numeral = req.stage === 1 ? 'II' : 'III'
  let title = nq.title.trim().toUpperCase()
  if (!title.startsWith(`TRIAL ${numeral}`)) {
    const theme = title.split('·').pop()?.trim() || 'CHOICE'
    title = `TRIAL ${numeral} · ${theme}`
  }
  return {
    scores,
    eliminate,
    next_question: {
      title: title.slice(0, 60),
      scenario: nq.scenario.trim().slice(0, MAX_QUESTION),
      question: nq.question.trim().slice(0, 400),
    },
  }
}

function validateFinal(req: TrialRequest, data: unknown): Record<string, unknown> | string {
  if (!data || typeof data !== 'object') return 'no data'
  const d = data as Record<string, unknown>
  if (!d.scores || typeof d.scores !== 'object') return 'scores missing'
  const scores = normalizeScores(d.scores as Record<string, unknown>)
  const ranked = [...req.remaining_rings].sort((a, b) => scores[b] - scores[a])
  let primary = isRing(d.primary) && req.remaining_rings.includes(d.primary) ? d.primary : ranked[0]
  let secondary =
    isRing(d.secondary) && req.remaining_rings.includes(d.secondary) && d.secondary !== primary
      ? d.secondary
      : ranked.find((r) => r !== primary)!
  // Make scores consistent with the chosen ranking.
  if (scores[secondary] > scores[primary]) [primary, secondary] = [secondary, primary]
  for (const r of RINGS) {
    if (r !== primary && r !== secondary && scores[r] >= scores[secondary]) {
      scores[r] = Math.max(0, scores[secondary] - 0.02)
    }
  }
  const archetype = typeof d.archetype === 'string' && d.archetype.trim() ? d.archetype.trim() : 'The Uncharted Signal'
  const summary = typeof d.summary === 'string' ? d.summary.trim() : ''
  const secondarySummary = typeof d.secondary_summary === 'string' ? d.secondary_summary.trim() : ''
  const evidence = Array.isArray(d.evidence)
    ? (d.evidence.filter((e) => typeof e === 'string' && e.trim()) as string[]).slice(0, 3).map((e) => e.trim())
    : []
  if (!summary || evidence.length === 0) return 'summary or evidence missing'
  const identity =
    typeof d.identity === 'string' && d.identity.trim()
      ? d.identity.trim().toUpperCase()
      : `${FORCES[primary].toUpperCase()} POWERED BY ${FORCES[secondary].toUpperCase()}`
  return {
    primary,
    primary_force: FORCES[primary],
    primary_score: Math.round(scores[primary] * 100),
    secondary,
    secondary_force: FORCES[secondary],
    secondary_score: Math.round(scores[secondary] * 100),
    archetype: archetype.replace(/[.!]+$/, '').slice(0, 60),
    summary: summary.slice(0, 900),
    secondary_summary: secondarySummary.slice(0, 400),
    evidence,
    identity: identity.slice(0, 80),
    spectrum: Object.fromEntries(RINGS.map((r) => [r, Math.round(scores[r] * 100)])),
  }
}

// ---------- model call ----------

async function callModel(env: Env, req: TrialRequest): Promise<unknown> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 60_000 })
  const response = await client.beta.messages.create({
    model: env.MODEL || 'claude-fable-5-1',
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserMessage(req) }],
    output_config: {
      effort: 'medium',
      format: { type: 'json_schema', schema: req.stage === 3 ? finalSchema : intermediateSchema },
    },
  })

  if (response.stop_reason === 'refusal') {
    throw new Error(`refusal: ${response.stop_details?.explanation ?? 'declined'}`)
  }
  if (response.stop_reason === 'max_tokens') {
    throw new Error('max_tokens reached before JSON completed')
  }
  const text = response.content
    .filter((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text')
    .map((b) => b.text)
    .join('')
  return JSON.parse(text)
}

// ---------- worker ----------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin')
    const cors = corsHeaders(origin, env)
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (url.pathname === '/health') return json({ ok: true }, 200, cors)
    if (request.method !== 'POST' || url.pathname !== '/trial') {
      return json({ error: 'not_found' }, 404, cors)
    }
    if (!env.ANTHROPIC_API_KEY) return json({ error: 'server_misconfigured' }, 500, cors)

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return json({ error: 'invalid_json' }, 400, cors)
    }
    const parsed = parseRequest(body)
    if (typeof parsed === 'string') return json({ error: 'bad_request', detail: parsed }, 400, cors)

    try {
      const raw = await callModel(env, parsed)
      const result = parsed.stage === 3 ? validateFinal(parsed, raw) : validateIntermediate(parsed, raw)
      if (typeof result === 'string') {
        return json({ error: 'invalid_model_output', detail: result }, 502, cors)
      }
      return json(result, 200, cors)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown'
      console.error('trial failed', message)
      return json({ error: 'upstream_failed', detail: message.slice(0, 200) }, 502, cors)
    }
  },
} satisfies ExportedHandler<Env>
