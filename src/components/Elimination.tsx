import { useEffect, useState } from 'react'
import RingField from './RingField'
import type { Ring as RingId } from '../lib/types'

interface Props {
  stage: 1 | 2
  before: RingId[]
  eliminated: RingId[]
  onDone: () => void
}

export default function Elimination({ stage, before, eliminated, onDone }: Props) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0)
  const after = before.filter((r) => !eliminated.includes(r))
  useEffect(() => {
    const t = [setTimeout(() => setPhase(1), 900), setTimeout(() => setPhase(2), 2700), setTimeout(onDone, 4600)]
    return () => t.forEach(clearTimeout)
  }, [onDone])
  const headline = stage === 1 ? '2 signals lost' : 'Only 3 signals remain'
  return (
    <main className="screen">
      <div className="status">
        <RingField
          remaining={phase >= 1 ? after : before}
          dying={phase === 1 ? eliminated : []}
          mode={phase === 2 ? 'idle' : 'analyzing'}
          size={phase === 2 && stage === 2 ? 76 : 52}
        />
        <span className="status__text" key={phase}>
          {phase === 0 ? 'Analyzing response...' : headline}
        </span>
        {phase === 2 && (
          <span className="small fade-in">{stage === 1 ? 'Five rings are still watching.' : 'The final trial begins.'}</span>
        )}
      </div>
    </main>
  )
}
