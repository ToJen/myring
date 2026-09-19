import { RING_COLOR } from '../lib/rings'
import type { Ring as RingId } from '../lib/types'

interface Props {
  ring: RingId
  size?: number
  state?: 'idle' | 'dim' | 'dying' | 'gone' | 'breathe'
  className?: string
  style?: React.CSSProperties
}

export default function Ring({ ring, size = 48, state = 'idle', className = '', style }: Props) {
  const cls = ['ring', state !== 'idle' ? `ring--${state}` : '', className].filter(Boolean).join(' ')
  return (
    <span
      className={cls}
      style={{ width: size, height: size, color: RING_COLOR[ring], borderWidth: Math.max(3, size / 12), ...style }}
      aria-label={ring}
      role="img"
    />
  )
}
