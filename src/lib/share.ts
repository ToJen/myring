import { RING_FORCE } from './rings'
import type { Result } from './types'

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function shareText(result: Result): string {
  return [
    `My ring chose ${result.primary.toUpperCase()}.`,
    '',
    `${cap(RING_FORCE[result.primary])}: ${result.primary_score}%`,
    `Secondary: ${cap(RING_FORCE[result.secondary])}`,
    '',
    'Which ring chooses you?',
  ].join('\n')
}

export function challengeText(result: Result): string {
  return `I was chosen by ${result.primary.toUpperCase()} × ${result.secondary.toUpperCase()}. Will your ring match?`
}

/** Returns 'shared' | 'copied' | 'failed'. */
export async function share(text: string, url: string): Promise<'shared' | 'copied' | 'failed'> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: 'MyRing', text, url })
      return 'shared'
    } catch (err) {
      if ((err as Error).name === 'AbortError') return 'failed'
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`)
    return 'copied'
  } catch {
    return 'failed'
  }
}
