import { adminMock } from '../../data/misc'
import { cx } from '../../lib/format'

export default function AdminCustomers() {
  return (
    <div className="apage">
      <header className="apage__head">
        <div><p className="eyebrow">People</p><h1>Customers</h1></div>
      </header>
      <section className="apanel">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Orders</th><th>Points</th><th>Tier</th><th>Joined</th></tr></thead>
          <tbody>
            {adminMock.customers.map((c) => (
              <tr key={c.email}>
                <td className="apage__strong">{c.name}</td>
                <td className="apage__muted">{c.email}</td>
                <td>{c.orders}</td>
                <td>{c.points.toLocaleString()}</td>
                <td><span className={cx('pill', c.tier === 'Gold' ? 'pill--ready' : 'pill--confirmed')}>{c.tier}</span></td>
                <td className="apage__muted">{c.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
