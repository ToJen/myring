import { RING_COLOR } from '../lib/rings'
import type { Ring } from '../lib/types'

export default function Logo({ size = 'small', accent }: { size?: 'hero' | 'small'; accent?: Ring }) {
  return (
    <a
      className={`logo logo--${size}`}
      href="#/"
      style={accent ? ({ '--accent': RING_COLOR[accent] } as React.CSSProperties) : undefined}
      aria-label="MyRing home"
    >
      MyR
      <span className="logo__i">
        <span className="logo__i-glyph">i</span>
      </span>
      ng
    </a>
  )
}
