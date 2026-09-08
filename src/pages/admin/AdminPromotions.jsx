import { useEffect, useState } from 'react'
import { adminMock } from '../../data/misc'
import { useToast } from '../../context/ToastContext'
import { supabaseConfigured } from '../../lib/supabase'
import { listPromotions, togglePromotion } from '../../lib/adminApi'
import { cx } from '../../lib/format'

const live = supabaseConfigured

export default function AdminPromotions() {
  const { toast } = useToast()
  const [promos, setPromos] = useState(live ? [] : adminMock.promos)
  const [loading, setLoading] = useState(live)

  useEffect(() => {
    if (!live) return
    listPromotions()
      .then(setPromos)
      .catch((err) => toast(`Couldn't load promotions — ${err.message}`, 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const toggle = async (p) => {
    setPromos((prev) => prev.map((x) => (x.code === p.code ? { ...x, active: !x.active } : x)))
    if (!live) {
      toast(`Promo ${p.code} updated.`)
      return
    }
    try {
      await togglePromotion(p.id, !p.active)
      toast(`Promo ${p.code} ${!p.active ? 'activated' : 'paused'}.`)
    } catch (err) {
      setPromos((prev) => prev.map((x) => (x.code === p.code ? { ...x, active: p.active } : x)))
      toast(`Update failed — ${err.message}`, 'error')
    }
  }

  return (
    <div className="apage">
      <header className="apage__head">
        <div><p className="eyebrow">Marketing</p><h1>Promotions</h1></div>
      </header>
      <section className="apanel">
        <table className="table">
          <thead><tr><th>Code</th><th>Description</th><th>Kind</th><th>Uses</th><th>Active</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="apage__empty">Loading promotions…</td></tr>
            ) : (
              promos.map((p) => (
                <tr key={p.id || p.code}>
                  <td className="mono apage__strong">{p.code}</td>
                  <td>{p.desc}</td>
                  <td className="apage__muted">{p.kind}</td>
                  <td>{p.uses}</td>
                  <td>
                    <button type="button" className={cx('toggle', !p.active && 'is-off')} onClick={() => toggle(p)} aria-label={`Toggle ${p.code}`}>
                      <span />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && promos.length === 0 && <p className="apage__empty">No promotions yet — add codes in the promotions table.</p>}
      </section>
      <p className="apage__note">Codes apply at checkout once online payments ship — currently honored in-store.</p>
    </div>
  )
}
