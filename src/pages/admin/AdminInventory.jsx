import { useState } from 'react'
import { adminMock } from '../../data/misc'
import { thriftProducts } from '../../data/thrift'
import { cx, peso } from '../../lib/format'

export default function AdminInventory() {
  const [tab, setTab] = useState('supplies')
  const supplies = adminMock.supplies
  const lowCount = supplies.filter((s) => s.stock < s.par * 0.5).length

  return (
    <div className="apage">
      <header className="apage__head">
        <div><p className="eyebrow">Stock</p><h1>Inventory</h1></div>
        <div className="atabs">
          <button type="button" className={cx('atabs__tab', tab === 'supplies' && 'is-active')} onClick={() => setTab('supplies')}>
            Coffee supplies {lowCount > 0 && <span className="atabs__badge">{lowCount}</span>}
          </button>
          <button type="button" className={cx('atabs__tab', tab === 'pieces' && 'is-active')} onClick={() => setTab('pieces')}>
            Thrift pieces
          </button>
        </div>
      </header>

      {tab === 'supplies' ? (
        <section className="apanel">
          <table className="table">
            <thead><tr><th>Item</th><th>Current</th><th>Par level</th><th>Status</th><th>Fill</th></tr></thead>
            <tbody>
              {supplies.map((s) => {
                const pct = Math.round((s.stock / s.par) * 100)
                const low = s.stock < s.par * 0.5
                return (
                  <tr key={s.name}>
                    <td className="apage__strong">{s.name}</td>
                    <td>{s.stock} {s.unit}</td>
                    <td className="apage__muted">{s.par} {s.unit}</td>
                    <td>
                      {low
                        ? <span className="pill pill--low">Low stock</span>
                        : <span className="pill pill--ok">In stock</span>}
                    </td>
                    <td className="acell-bar"><span style={{ width: `${Math.min(100, pct)}%` }} className={cx(low && 'is-low')} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="apanel">
          <table className="table">
            <thead><tr><th>Piece</th><th>Brand</th><th>Size</th><th>Condition</th><th>Price</th><th>Status</th></tr></thead>
            <tbody>
              {thriftProducts.map((p) => (
                <tr key={p.id}>
                  <td className="apage__strong">{p.name}</td>
                  <td>{p.brand}</td>
                  <td>{p.size}</td>
                  <td>{p.condition}/10</td>
                  <td>{peso(p.price)}</td>
                  <td>
                    {p.status === 'sold'
                      ? <span className="pill pill--cancelled">Sold</span>
                      : <span className="pill pill--ok">Available</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="apage__note">Every thrift piece is one of one — the cart enforces a single purchase per piece automatically.</p>
        </section>
      )}
    </div>
  )
}
