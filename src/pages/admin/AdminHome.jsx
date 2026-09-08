import { Link } from 'react-router-dom'
import { TrendingUp, Coffee, Shirt, Clock, AlertTriangle, CalendarDays, ArrowUpRight } from 'lucide-react'
import { adminMock } from '../../data/misc'
import { fmtDateTime, peso, cx } from '../../lib/format'
import { StatusPill } from '../../components/OrderTimeline'

const ICONS = { trend: TrendingUp, coffee: Coffee, shirt: Shirt, clock: Clock, alert: AlertTriangle, calendar: CalendarDays }
const LOW = adminMock.supplies.filter((s) => s.stock < s.par * 0.5).slice(0, 5)

export default function AdminHome() {
  return (
    <div className="apage">
      <header className="apage__head">
        <div><p className="eyebrow">Dashboard</p><h1>Overview</h1></div>
        <p className="apage__date">Saturday, Sep 7 2026 · Poblacion</p>
      </header>

      <div className="acards">
        {adminMock.stats.map((s) => {
          const Icon = ICONS[s.icon]
          return (
            <div key={s.label} className="acard">
              <span className="acard__icon"><Icon size={16} strokeWidth={1.8} /></span>
              <p className="acard__value">{s.value}</p>
              <p className="acard__label">{s.label}</p>
              <p className="acard__delta">{s.delta}</p>
            </div>
          )
        })}
      </div>

      <div className="acols">
        <section className="apanel">
          <header className="apanel__head"><h2>Recent orders</h2><Link to="/admin/orders" className="apanel__more">All orders <ArrowUpRight size={13} /></Link></header>
          <table className="table">
            <thead><tr><th>Ref</th><th>Customer</th><th>Items</th><th>Total</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {adminMock.recentOrders.map((o) => (
                <tr key={o.ref}>
                  <td className="mono">{o.ref}</td>
                  <td>{o.customer}</td>
                  <td>{o.items}</td>
                  <td>{peso(o.total)}</td>
                  <td>{o.type}</td>
                  <td><StatusPill status={o.status} /></td>
                  <td className="apage__muted">{fmtDateTime(o.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="apanel">
          <header className="apanel__head"><h2>Low stock</h2><Link to="/admin/inventory" className="apanel__more">Inventory <ArrowUpRight size={13} /></Link></header>
          <ul className="alow">
            {LOW.map((s) => (
              <li key={s.name}>
                <div>
                  <p className="alow__name">{s.name}</p>
                  <p className="alow__meta">{s.stock} {s.unit} left · par {s.par} {s.unit}</p>
                </div>
                <span className={cx('alow__bar')}>
                  <span style={{ width: `${Math.max(6, (s.stock / s.par) * 100)}%` }} className="is-low" />
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
