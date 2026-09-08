import { useCountdown } from '../hooks'
import { DROP } from '../data/misc'

export function dropTarget() {
  const stored = Number(localStorage.getItem(DROP.targetKey) || 0)
  if (stored > Date.now()) return stored
  const next = Date.now() + DROP.offsetMs
  localStorage.setItem(DROP.targetKey, String(next))
  return next
}

const pad = (n) => String(n).padStart(2, '0')

export default function Countdown({ target, light = true }) {
  const { days, hours, minutes } = useCountdown(target)
  const cells = [
    [pad(days), 'Days'],
    [pad(hours), 'Hours'],
    [pad(minutes), 'Minutes'],
  ]
  return (
    <div className={`countdown ${light ? 'countdown--light' : ''}`} role="timer" aria-label="Time until next drop">
      {cells.map(([num, label], i) => (
        <div className="countdown__cell" key={label}>
          <span className="countdown__num">{num}</span>
          <span className="countdown__label">{label}</span>
          {i < cells.length - 1 && <span className="countdown__tick" aria-hidden="true">:</span>}
        </div>
      ))}
    </div>
  )
}
