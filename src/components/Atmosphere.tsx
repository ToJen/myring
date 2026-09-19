import { RING_COLOR } from '../lib/rings'
import type { Ring } from '../lib/types'

interface Props {
  /** Rings currently alive; each becomes a soft light source. */
  rings: Ring[]
  /** 0 = barely-there dots, 1 = subtle, 2 = present, 3 = dominant */
  intensity: 0 | 1 | 2 | 3
  /** When set, this ring floods the scene; others fade to accents. */
  dominant?: Ring
  secondary?: Ring
}

const POSITIONS: Record<Ring, [number, number]> = {
  green: [20, 20],
  yellow: [80, 15],
  red: [15, 70],
  orange: [85, 75],
  blue: [50, 5],
  indigo: [50, 95],
  violet: [90, 45],
}

const OPACITY = [0.06, 0.14, 0.26, 0.42]

export default function Atmosphere({ rings, intensity, dominant, secondary }: Props) {
  return (
    <div className="atmos" aria-hidden="true">
      {rings.map((r, i) => {
        const [x, y] = POSITIONS[r]
        const isDom = dominant === r
        const isSec = secondary === r
        let opacity = OPACITY[intensity]
        if (dominant) opacity = isDom ? 0.55 : isSec ? 0.22 : 0
        return (
          <div
            key={r}
            className="atmos__blob"
            style={{
              left: isDom ? '50%' : `${x}%`,
              top: isDom ? '40%' : `${y}%`,
              background: RING_COLOR[r],
              opacity,
              animationDelay: `${-i * 2.3}s`,
              width: isDom ? '110vmax' : undefined,
              height: isDom ? '110vmax' : undefined,
            }}
          />
        )
      })}
      <div className="atmos__grain" />
    </div>
  )
}
