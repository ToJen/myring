import Ring from './Ring'
import { RING_FORCE, RINGS } from '../lib/rings'
import type { Ring as RingId } from '../lib/types'

interface Props {
  remaining: RingId[]
  dying?: RingId[]
  mode?: 'scan' | 'idle' | 'analyzing' | 'dim'
  size?: number
  labels?: boolean
}

export default function RingField({ remaining, dying = [], mode = 'idle', size = 52, labels = true }: Props) {
  const cls = ['ringfield', mode === 'scan' ? 'ringfield--scan' : '', mode === 'analyzing' ? 'ringfield--analyzing' : ''].join(' ')
  return (
    <div className={cls}>
      {RINGS.map((r, i) => {
        const alive = remaining.includes(r)
        const isDying = dying.includes(r)
        if (!alive && !isDying) return null
        const state = isDying ? 'dying' : mode === 'dim' ? 'dim' : mode === 'idle' ? 'breathe' : 'idle'
        return (
          <div className="ringfield__item" key={r} style={{ animationDelay: `${i * 0.12}s` }}>
            <Ring ring={r} size={size} state={state} style={{ animationDelay: `${(i * 0.37) % 2}s` }} />
            {labels && (
              <span className="ringfield__label" style={{ opacity: isDying ? 0 : 1 }}>
                {RING_FORCE[r]}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
