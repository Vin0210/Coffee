import { useEffect, useState } from 'react'
import { adminMock } from '../../data/misc'
import { useToast } from '../../context/ToastContext'
import { supabaseConfigured } from '../../lib/supabase'
import { listCustomers } from '../../lib/adminApi'
import { cx } from '../../lib/format'

const live = supabaseConfigured

export default function AdminCustomers() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState(live ? [] : adminMock.customers)
  const [loading, setLoading] = useState(live)

  useEffect(() => {
    if (!live) return
    listCustomers()
      .then(setCustomers)
      .catch((err) => toast(`Couldn't load customers — ${err.message}`, 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  return (
    <div className="apage">
      <header className="apage__head">
        <div><p className="eyebrow">People</p><h1>Customers</h1></div>
      </header>
      <section className="apanel">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Orders</th><th>Points</th><th>Tier</th><th>Joined</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="apage__empty">Loading customers…</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id || c.email}>
                  <td className="apage__strong">{c.name}</td>
                  <td className="apage__muted">{c.email}</td>
                  <td>{c.orders}</td>
                  <td>{Number(c.points).toLocaleString()}</td>
                  <td><span className={cx('pill', c.tier === 'Gold' ? 'pill--ready' : 'pill--confirmed')}>{c.tier}</span></td>
                  <td className="apage__muted">{c.joined}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && customers.length === 0 && <p className="apage__empty">No customers yet — they appear here after signing up.</p>}
      </section>
    </div>
  )
}
