import { useState } from 'react'
import { adminMock } from '../../data/misc'
import { useToast } from '../../context/ToastContext'
import { cx } from '../../lib/format'

export default function AdminPromotions() {
  const { toast } = useToast()
  const [promos, setPromos] = useState(adminMock.promos)

  const toggle = (code) => {
    setPromos((prev) => prev.map((p) => (p.code === code ? { ...p, active: !p.active } : p)))
    toast(`Promo ${code} updated.`)
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
            {promos.map((p) => (
              <tr key={p.code}>
                <td className="mono apage__strong">{p.code}</td>
                <td>{p.desc}</td>
                <td className="apage__muted">{p.kind}</td>
                <td>{p.uses}</td>
                <td>
                  <button type="button" className={cx('toggle', !p.active && 'is-off')} onClick={() => toggle(p.code)} aria-label={`Toggle ${p.code}`}>
                    <span />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="apage__note">Codes apply at checkout once online payments ship — currently honored in-store.</p>
    </div>
  )
}
