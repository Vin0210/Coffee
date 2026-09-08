import { useEffect, useState } from 'react'
import { adminMock } from '../../data/misc'
import { peso } from '../../lib/format'
import { Coffee, Shirt } from 'lucide-react'
import { supabaseConfigured } from '../../lib/supabase'
import { salesReport } from '../../lib/adminApi'

const live = supabaseConfigured

export default function AdminReports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(live)

  useEffect(() => {
    if (!live) return
    salesReport(7)
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setLoading(false))
  }, [])

  const salesWeek = report?.salesWeek || adminMock.salesWeek
  const MAX = Math.max(1, ...salesWeek.map((d) => d.v))
  const weekTotal = report?.weekTotal ?? adminMock.salesWeek.reduce((n, d) => n + d.v, 0)
  const averageOrder = report?.averageOrder ?? 96
  const coffeeShare = report?.coffeeShare ?? 62
  const topSellers = report?.topSellers || adminMock.topSellers

  return (
    <div className="apage">
      <header className="apage__head">
        <div><p className="eyebrow">Insights</p><h1>Reports</h1></div>
      </header>

      <div className="acards acards--3">
        <div className="acard"><p className="acard__value">{loading ? '…' : peso(weekTotal)}</p><p className="acard__label">This week's sales</p><p className="acard__delta">{live ? 'live, excluding cancelled' : '+12% vs last week'}</p></div>
        <div className="acard"><p className="acard__value">{loading ? '…' : peso(averageOrder)}</p><p className="acard__label">Average order</p><p className="acard__delta">coffee-led baskets</p></div>
        <div className="acard"><p className="acard__value">{loading ? '…' : `${coffeeShare} / ${100 - coffeeShare}`}</p><p className="acard__label">Coffee / thrift mix</p><p className="acard__delta">of total revenue</p></div>
      </div>

      <div className="acols">
        <section className="apanel">
          <header className="apanel__head"><h2>Sales — last 7 days</h2></header>
          <div className="achart">
            {salesWeek.map((d) => (
              <div key={d.day} className="achart__col">
                <span className="achart__val">{(d.v / 1000).toFixed(1)}k</span>
                <span className="achart__bar" style={{ height: `${(d.v / MAX) * 100}%` }} />
                <span className="achart__day">{d.day}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="apanel">
          <header className="apanel__head"><h2>Top sellers — 30 days</h2></header>
          {topSellers.length === 0 ? (
            <p className="apage__empty">No sales yet — top sellers appear after the first orders.</p>
          ) : (
            <ul className="atop">
              {topSellers.map((t) => (
                <li key={t.name}>
                  <span className="atop__icon">{t.type === 'coffee' ? <Coffee size={14} strokeWidth={1.8} /> : <Shirt size={14} strokeWidth={1.8} />}</span>
                  <span className="atop__name">{t.name}</span>
                  <span className="atop__count">{t.count} {t.type === 'coffee' ? 'sold' : 'rehomed'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
