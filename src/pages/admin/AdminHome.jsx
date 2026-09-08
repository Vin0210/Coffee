import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Coffee, Shirt, Clock, AlertTriangle, CalendarDays, ArrowUpRight } from 'lucide-react'
import { adminMock } from '../../data/misc'
import { fmtDateTime, peso, cx } from '../../lib/format'
import { StatusPill } from '../../components/OrderTimeline'
import { supabaseConfigured } from '../../lib/supabase'
import { dashboardStats } from '../../lib/adminApi'

const live = supabaseConfigured
const ICONS = { trend: TrendingUp, coffee: Coffee, shirt: Shirt, clock: Clock, alert: AlertTriangle, calendar: CalendarDays }

export default function AdminHome() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState(adminMock.recentOrders)
  const [low, setLow] = useState(adminMock.supplies.filter((s) => s.stock < s.par * 0.5).slice(0, 5))
  const [loading, setLoading] = useState(live)

  useEffect(() => {
    if (!live) return
    dashboardStats()
      .then((d) => {
        setStats([
          { label: "Today's Sales", value: peso(d.sales), delta: 'today, excluding cancelled', icon: 'trend' },
          { label: 'Coffee Orders', value: String(d.coffeeOrders), delta: 'today', icon: 'coffee' },
          { label: 'Thrift Orders', value: String(d.thriftOrders), delta: 'today', icon: 'shirt' },
          { label: 'Pending Orders', value: String(d.pending), delta: 'needs confirmation', icon: 'clock' },
          { label: 'Low Stock', value: String(d.lowStock.length), delta: d.lowStock.length ? d.lowStock.map((s) => s.name).join(' · ') : 'all stocked', icon: 'alert' },
          { label: 'Reservations', value: String(d.reservationsToday), delta: 'today onwards', icon: 'calendar' },
        ])
        setRecent(d.recent)
        setLow(d.lowStock.slice(0, 5).map((s) => ({ name: s.name, stock: s.stock, unit: 'pcs', par: Math.max(s.stock + 1, 6) })))
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const cards = stats || adminMock.stats
  const lowList = live && stats ? low : adminMock.supplies.filter((s) => s.stock < s.par * 0.5).slice(0, 5)

  return (
    <div className="apage">
      <header className="apage__head">
        <div><p className="eyebrow">Dashboard</p><h1>Overview</h1></div>
        <p className="apage__date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} · Zamboanga</p>
      </header>

      <div className="acards">
        {(loading ? adminMock.stats : cards).map((s) => {
          const Icon = ICONS[s.icon]
          return (
            <div key={s.label} className="acard">
              <span className="acard__icon"><Icon size={16} strokeWidth={1.8} /></span>
              <p className="acard__value">{loading ? '…' : s.value}</p>
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
              {recent.map((o) => (
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
          {recent.length === 0 && <p className="apage__empty">No orders yet — they land here the moment checkout runs.</p>}
        </section>

        <section className="apanel">
          <header className="apanel__head"><h2>Low stock</h2><Link to="/admin/inventory" className="apanel__more">Inventory <ArrowUpRight size={13} /></Link></header>
          <ul className="alow">
            {lowList.map((s) => (
              <li key={s.name}>
                <div>
                  <p className="alow__name">{s.name}</p>
                  <p className="alow__meta">{s.stock} {s.unit} left · par {s.par} {s.unit}</p>
                </div>
                <span className={cx('alow__bar')}>
                  <span style={{ width: `${Math.max(6, (s.stock / Math.max(s.par, 1)) * 100)}%` }} className="is-low" />
                </span>
              </li>
            ))}
          </ul>
          {lowList.length === 0 && <p className="apage__empty">Nothing running low.</p>}
        </section>
      </div>
    </div>
  )
}
