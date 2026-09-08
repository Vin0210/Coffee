import { useEffect, useState } from 'react'
import { adminMock } from '../../data/misc'
import { fmtDateTime, peso, cx } from '../../lib/format'
import { STATUS_FLOW, STATUS_LABELS } from '../../components/OrderTimeline'
import { useToast } from '../../context/ToastContext'
import { supabaseConfigured } from '../../lib/supabase'
import { listOrders, updateOrderStatus } from '../../lib/adminApi'

const live = supabaseConfigured
const ALL = [...STATUS_FLOW, 'cancelled']

export default function AdminOrders() {
  const { toast } = useToast()
  const [orders, setOrders] = useState(live ? [] : adminMock.recentOrders)
  const [loading, setLoading] = useState(live)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!live) return
    listOrders()
      .then(setOrders)
      .catch((err) => toast(`Couldn't load orders — ${err.message}`, 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const setStatus = async (id, ref, status) => {
    setOrders((prev) => prev.map((o) => (o.ref === ref ? { ...o, status } : o)))
    if (!live) return
    try {
      await updateOrderStatus(id, status)
      toast(`Order ${ref} → ${STATUS_LABELS[status]}.`)
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
          <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="apage__empty">Loading orders…</td></tr>
            ) : (
              list.map((o) => (
                <tr key={o.ref}>
                  <td className="mono">{o.ref}</td>
                  <td>{o.customer}</td>
                  <td>{o.items}</td>
                  <td>{peso(o.total)}</td>
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
              ))
            )}
          </tbody>
        </table>
        {!loading && list.length === 0 && <p className="apage__empty">No orders with this status.</p>}
      </section>
    </div>
  )
}
