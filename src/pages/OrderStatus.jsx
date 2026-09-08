import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Page } from '../components/Reveal'
import OrderTimeline, { StatusPill } from '../components/OrderTimeline'
import { EmptyState } from '../components/SectionHead'
import { useMeta } from '../hooks'
import { getOrder, effectiveStatus } from '../lib/orders'
import { peso, fmtDateTime, cx } from '../lib/format'
import { ease } from '../components/Reveal'

export default function OrderStatus() {
  const { ref } = useParams()
  const [order, setOrder] = useState(undefined) // undefined = loading, null = not found
  useMeta({ title: `Order ${ref}` })

  useEffect(() => {
    let alive = true
    getOrder(ref).then((o) => { if (alive) setOrder(o) })
    const t = setInterval(() => {
      getOrder(ref).then((o) => { if (alive) setOrder(o) })
    }, 20000)
    return () => { alive = false; clearInterval(t) }
  }, [ref])

  if (order === undefined) {
    return <Page><div className="wrap section"><div className="sk sk--block" style={{ height: 320 }} /></div></Page>
  }

  if (order === null) {
    return (
      <Page><div className="wrap section">
        <EmptyState
          title="Order not found" sub={`We couldn't find ${ref}. Check the reference and try again.`}
          action={<Link to="/menu" className="btn btn--solid btn--sm">Back to the menu</Link>}
        />
      </div></Page>
    )
  }

  const status = effectiveStatus(order)

  return (
    <Page>
      <div className="wrap section narrow">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <p className="eyebrow">{order.fresh ? 'Order placed — thank you!' : 'Order tracking'}</p>
          <h1 className="order__ref">{order.ref}</h1>
          <p className="order__meta">
            Placed {fmtDateTime(order.created_at)} · {order.order_type === 'delivery' ? 'Delivery' : 'Pickup'}
            {order.pickup_time ? ` · ${order.pickup_time}` : ''}
          </p>
          <div className="order__pillrow"><StatusPill status={status} /></div>
        </motion.div>

        <motion.div
          className="order__timeline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease }}
        >
          <OrderTimeline status={status} />
        </motion.div>

        <motion.div
          className="order__detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
        >
          <h3>Items</h3>
          <ul className="order__items">
            {(order.items || []).map((it, i) => (
              <li key={i}>
                <div>
                  <p className="order__item-name">{it.name} <span>× {it.qty}</span></p>
                  {it.options && Object.keys(it.options).length > 0 && (
                    <p className="order__item-opts">
                      {[it.options.size, it.options.milk, it.options.sugar ? `${it.options.sugar} sugar` : null, ...(it.options.addons || [])]
                        .filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <span>{peso(it.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="cartpage__row"><span>Subtotal</span><strong>{peso(order.subtotal)}</strong></div>
          {order.fee > 0 && <div className="cartpage__row"><span>Delivery</span><strong>{peso(order.fee)}</strong></div>}
          <div className="cartpage__row cartpage__row--total"><span>Total · cash</span><strong>{peso(order.total)}</strong></div>

          {order.order_type === 'delivery'
            ? <p className="order__where">Delivering to: {order.address}</p>
            : <p className="order__where">Pickup at Alegre × Good Habits — Tumaga - Putik Rd, Zamboanga City</p>}
        </motion.div>

        <p className={cx('order__note', status === 'ready' && 'is-live')}>
          {status === 'received' && 'We received your order — confirming shortly.'}
          {status === 'confirmed' && 'Confirmed! The bar has your ticket.'}
          {status === 'preparing' && 'Being prepared right now — steam and espresso involved.'}
          {status === 'ready' && order.order_type === 'pickup' && 'Ready! Ask for your name at the bar.'}
          {status === 'ready' && order.order_type === 'delivery' && 'Ready — rider on the way.'}
          {status === 'completed' && 'Completed. Come back soon — the racks restock weekly.'}
          {status === 'cancelled' && 'This order was cancelled.'}
        </p>
      </div>
    </Page>
  )
}
