import { useState } from 'react'
import { adminMock } from '../../data/misc'
import { fmtDateTime, peso, cx } from '../../lib/format'
import { STATUS_FLOW, STATUS_LABELS } from '../../components/OrderTimeline'

const ALL = [...STATUS_FLOW, 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState(adminMock.recentOrders)
  const [filter, setFilter] = useState('all')

  const setStatus = (ref, status) => {
    setOrders((prev) => prev.map((o) => (o.ref === ref ? { ...o, status } : o)))
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
            {list.map((o) => (
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
                    onChange={(e) => setStatus(o.ref, e.target.value)}
                    aria-label={`Status for ${o.ref}`}
                  >
                    {ALL.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </td>
                <td className="apage__muted">{fmtDateTime(o.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="apage__empty">No orders with this status.</p>}
      </section>
    </div>
  )
}
