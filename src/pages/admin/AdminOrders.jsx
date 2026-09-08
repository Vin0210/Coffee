import { Fragment, useEffect, useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { adminMock } from '../../data/misc'
import { fmtDateTime, peso, cx } from '../../lib/format'
import { STATUS_FLOW, STATUS_LABELS } from '../../components/OrderTimeline'
import { useToast } from '../../context/ToastContext'
import { supabaseConfigured } from '../../lib/supabase'
import { listOrders, updateOrderStatus } from '../../lib/adminApi'
import { sendOrderStatus } from '../../lib/email'

const live = supabaseConfigured
const ALL = [...STATUS_FLOW, 'cancelled']

export default function AdminOrders() {
  const { toast } = useToast()
  const [orders, setOrders] = useState(live ? [] : adminMock.recentOrders)
  const [loading, setLoading] = useState(live)
  const [filter, setFilter] = useState('all')
  const [openRef, setOpenRef] = useState(null)

  useEffect(() => {
    if (!live) return
    listOrders()
      .then(setOrders)
      .catch((err) => toast(`Couldn't load orders — ${err.message}`, 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const setStatus = async (id, ref, status) => {
    const target = orders.find((o) => o.ref === ref)
    setOrders((prev) => prev.map((o) => (o.ref === ref ? { ...o, status } : o)))
    if (!live) return
    try {
      await updateOrderStatus(id, status)
      toast(`Order ${ref} → ${STATUS_LABELS[status]}.`)
      if ((status === 'ready' || status === 'completed') && target?.customer_email) {
        const res = await sendOrderStatus({
          ref, status,
          customer_email: target.customer_email,
          customer_name: target.customer,
          order_type: target.order_type,
          address: target.address,
        })
        toast(res.ok ? `Customer emailed — order ${status}.` : 'Status saved (email skipped).')
      }
    } catch (err) {
      toast(`Update failed — ${err.message}`, 'error')
      listOrders().then(setOrders).catch(() => {})
    }
  }

  const list = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="apage">
      <header className="apage__head">
        <div><p className="eyebrow">Fulfillment</p><h1>Orders</h1></div>
        <div className="atabs">
          {['all', ...ALL].map((s) => (
            <button key={s} type="button" className={cx('atabs__tab', filter === s && 'is-active')} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </header>

      <section className="apanel">
        <table className="table">
          <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Pay</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="apage__empty">Loading orders…</td></tr>
            ) : (
              list.map((o) => (
                <Fragment key={o.ref}>
                  <tr>
                    <td className="mono">
                      <button
                        type="button" onClick={() => setOpenRef(openRef === o.ref ? null : o.ref)}
                        aria-expanded={openRef === o.ref} aria-label={`Details for ${o.ref}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        {o.ref} <ChevronDown size={13} strokeWidth={2.2} style={{ transform: openRef === o.ref ? 'rotate(180deg)' : 'none' }} />
                      </button>
                    </td>
                    <td>{o.customer}</td>
                    <td>{o.items}</td>
                    <td>{peso(o.total)}</td>
                    <td>{o.payment_status === 'paid' || o.paid ? <span className="pill pill--ok">Paid</span> : <span className="pill">Unpaid</span>}</td>
                    <td>{o.type}</td>
                    <td>
                      <select
                        className={cx('table-select', `pill--${o.status}`)}
                        value={o.status}
                        onChange={(e) => setStatus(o.id, o.ref, e.target.value)}
                        aria-label={`Status for ${o.ref}`}
                      >
                        {ALL.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td className="apage__muted">{fmtDateTime(o.date)}</td>
                  </tr>
                  {openRef === o.ref && (
                    <tr key={`${o.ref}-detail`}>
                      <td colSpan={8}>
                        <p className="apage__strong">{o.customer} <span className="apage__muted">· {o.phone || 'no phone'} · {o.customer_email || 'no email'}</span></p>
                        {o.type === 'Delivery' || o.order_type === 'delivery' ? (
                          <p style={{ marginTop: 6 }}>
                            <MapPin size={13} strokeWidth={2} style={{ display: 'inline', verticalAlign: -2 }} /> {o.address || 'No address given'}
                            {o.delivery_lat != null && o.delivery_lng != null && (
                              <> · <a href={`https://www.google.com/maps/search/?api=1&query=${o.delivery_lat},${o.delivery_lng}`} target="_blank" rel="noreferrer">Open pin in Maps</a></>
                            )}
                          </p>
                        ) : (
                          <p className="apage__muted" style={{ marginTop: 6 }}>Pickup in store</p>
                        )}
                        {o.lines?.length > 0 && (
                          <p className="apage__muted" style={{ marginTop: 6 }}>
                            {o.lines.map((l) => `${l.name} × ${l.qty}`).join(' · ')}
                          </p>
                        )}
                        {o.note && <p style={{ marginTop: 6 }}><em>“{o.note}”</em></p>}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
        {!loading && list.length === 0 && <p className="apage__empty">No orders with this status.</p>}
      </section>
    </div>
  )
}
