import { useEffect, useState } from 'react'
import Logo from './Logo'
import { RING_COLOR, RINGS } from '../lib/rings'

export default function Landing({ onStart }: { onStart: () => void }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % RINGS.length), 1700)
    return () => clearInterval(t)
  }, [])
  const ring = RINGS[idx]
  const accent = RING_COLOR[ring]
  return (
    <main className="screen" style={{ '--accent': accent } as React.CSSProperties}>
      <Logo size="hero" accent={ring} />
      <div className="hero-ring" style={{ color: accent }} />
      <p className="landing__tagline">
        Seven rings. Seven forces.
        <br />
        One of them wants you.
      </p>
      <h1 className="landing__question">Which one?</h1>
      <div className="btn-row">
        <button className="btn btn--primary" onClick={onStart}>
          Find my ring
        </button>
        <span className="small">3 trials · about 60 seconds</span>
      </div>
    </main>
  )
}
