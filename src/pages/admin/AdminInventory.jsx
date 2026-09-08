import { useEffect, useState } from 'react'
import { adminMock } from '../../data/misc'
import { thriftProducts } from '../../data/thrift'
import { useToast } from '../../context/ToastContext'
import { supabaseConfigured } from '../../lib/supabase'
import { listSupplies, updateSupply } from '../../lib/adminApi'
import { useCatalog } from '../../context/CatalogContext'
import { cx, peso } from '../../lib/format'

const live = supabaseConfigured

export default function AdminInventory() {
  const { toast } = useToast()
  const { thrift, loading: catalogLoading } = useCatalog()
  const [tab, setTab] = useState('supplies')
  const [supplies, setSupplies] = useState(live ? [] : adminMock.supplies)
  const [loading, setLoading] = useState(live)

  useEffect(() => {
    if (!live) return
    listSupplies()
      .then(setSupplies)
      .catch((err) => toast(`Couldn't load supplies — ${err.message}`, 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const pieces = live ? thrift : thriftProducts
  const lowCount = supplies.filter((s) => Number(s.stock) < Number(s.par) * 0.5).length
  const keyOf = (s) => s.id ?? s.slug ?? s.name

  const bump = async (s, delta) => {
    const next = Math.max(0, Number(s.stock) + delta)
    const k = keyOf(s)
    setSupplies((prev) => prev.map((x) => (keyOf(x) === k ? { ...x, stock: next } : x)))
    if (!live) return
    try {
      await updateSupply(s.id, { stock: next })
    } catch (err) {
      setSupplies((prev) => prev.map((x) => (keyOf(x) === k ? { ...x, stock: s.stock } : x)))
      toast(`Update failed — ${err.message}`, 'error')
    }
  }

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
              {loading ? (
                <tr><td colSpan={5} className="apage__empty">Loading supplies…</td></tr>
              ) : (
                supplies.map((s) => {
                  const pct = Number(s.par) > 0 ? Math.round((Number(s.stock) / Number(s.par)) * 100) : 100
                  const low = Number(s.stock) < Number(s.par) * 0.5
                  return (
                    <tr key={s.slug || s.name}>
                      <td className="apage__strong">{s.name}</td>
                      <td>
                        <span className="qty qty--sm">
                          <button type="button" aria-label={`Use one ${s.name}`} onClick={() => bump(s, -1)}>−</button>
                          <span>{s.stock} {s.unit}</span>
                          <button type="button" aria-label={`Restock ${s.name}`} onClick={() => bump(s, 1)}>+</button>
                        </span>
                      </td>
                      <td className="apage__muted">{s.par} {s.unit}</td>
                      <td>
                        {low
                          ? <span className="pill pill--low">Low stock</span>
                          : <span className="pill pill--ok">In stock</span>}
                      </td>
                      <td className="acell-bar"><span style={{ width: `${Math.min(100, pct)}%` }} className={cx(low && 'is-low')} /></td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          {!live && <p className="apage__note">Demo quantities — connect Supabase and run <span className="mono">migration-supplies.sql</span> for live stock.</p>}
        </section>
      ) : (
        <section className="apanel">
          <table className="table">
            <thead><tr><th>Piece</th><th>Brand</th><th>Size</th><th>Condition</th><th>Price</th><th>Status</th></tr></thead>
            <tbody>
              {catalogLoading && live ? (
                <tr><td colSpan={6} className="apage__empty">Loading pieces…</td></tr>
              ) : (
                pieces.map((p) => (
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
                ))
              )}
            </tbody>
          </table>
          <p className="apage__note">Every thrift piece is one of one — the cart enforces a single purchase per piece automatically.</p>
        </section>
      )}
    </div>
  )
}
