import { Minus, Plus } from 'lucide-react'

export default function QtyStepper({ value, onChange, max = 20, small = false }) {
  return (
    <div className={`qty ${small ? 'qty--sm' : ''}`}>
      <button
        type="button" aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1}
      >
        <Minus size={14} strokeWidth={2.2} />
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button" aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
      >
        <Plus size={14} strokeWidth={2.2} />
      </button>
    </div>
  )
}
