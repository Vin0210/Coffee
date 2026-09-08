import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cx } from '../lib/format'

export const STATUS_FLOW = ['received', 'confirmed', 'preparing', 'ready', 'completed']
export const STATUS_LABELS = {
  received: 'Order Received', confirmed: 'Confirmed', preparing: 'Preparing',
  ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled',
}

export function StatusPill({ status }) {
  return <span className={cx('pill', `pill--${status}`)}>{STATUS_LABELS[status] || status}</span>
}

/** Vertical animated order timeline */
export default function OrderTimeline({ status }) {
  const cancelled = status === 'cancelled'
  const activeIdx = STATUS_FLOW.indexOf(status)

  return (
    <ol className="timeline" aria-label="Order status">
      {STATUS_FLOW.map((s, i) => {
        const done = !cancelled && i < activeIdx
        const active = !cancelled && i === activeIdx
        return (
          <li key={s} className={cx('timeline__step', done && 'is-done', active && 'is-active', cancelled && 'is-cancelled')}>
            <span className="timeline__dot">
              {done && <Check size={11} strokeWidth={3} />}
              {active && <motion.span className="timeline__pulse" animate={{ scale: [1, 1.8], opacity: [0.5, 0] }} transition={{ duration: 1.6, repeat: Infinity }} />}
            </span>
            <div className="timeline__text">
              <p className="timeline__label">{STATUS_LABELS[s]}</p>
              {active && <p className="timeline__hint">Current status</p>}
              {i === 3 && active && <p className="timeline__hint">See you soon</p>}
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <span className={cx('timeline__line', (done || active) && 'is-filled')} />
            )}
          </li>
        )
      })}
      {cancelled && (
        <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="timeline__cancelled">
          This order was cancelled. Talk to us if this looks wrong.
        </motion.li>
      )}
    </ol>
  )
}
