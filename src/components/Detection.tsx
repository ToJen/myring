import { useEffect, useState } from 'react'
import RingField from './RingField'
import { RINGS } from '../lib/rings'

export default function Detection({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const timers = [setTimeout(() => setPhase(1), 1600), setTimeout(() => setPhase(2), 2900), setTimeout(onDone, 4200)]
    return () => timers.forEach(clearTimeout)
  }, [onDone])
  return (
    <main className="screen">
      <div className="status">
        <span className="kicker kicker--glow">Scanning emotional spectrum</span>
        <RingField remaining={RINGS} mode="scan" size={44} />
        <span className="status__text" key={phase}>
          {phase === 0 ? ' ' : phase === 1 ? '7 signals detected' : 'Beginning trial'}
        </span>
      </div>
    </main>
  )
}
