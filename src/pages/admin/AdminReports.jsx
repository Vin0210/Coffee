import { adminMock } from '../../data/misc'
import { peso } from '../../lib/format'
import { Coffee, Shirt } from 'lucide-react'

const MAX = Math.max(...adminMock.salesWeek.map((d) => d.v))

export default function AdminReports() {
  const weekTotal = adminMock.salesWeek.reduce((n, d) => n + d.v, 0)

  return (
    <div className="apage">
      <header className="apage__head">
        <div><p className="eyebrow">Insights</p><h1>Reports</h1></div>
      </header>

      <div className="acards acards--3">
        <div className="acard"><p className="acard__value">{peso(weekTotal)}</p><p className="acard__label">This week's sales</p><p className="acard__delta">+12% vs last week</p></div>
        <div className="acard"><p className="acard__value">₱96</p><p className="acard__label">Average order</p><p className="acard__delta">coffee-led baskets</p></div>
        <div className="acard"><p className="acard__value">62 / 38</p><p className="acard__label">Coffee / thrift mix</p><p className="acard__delta">of total revenue</p></div>
      </div>

      <div className="acols">
        <section className="apanel">
          <header className="apanel__head"><h2>Sales — last 7 days</h2></header>
          <div className="achart">
            {adminMock.salesWeek.map((d) => (
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
          <ul className="atop">
            {adminMock.topSellers.map((t) => (
              <li key={t.name}>
                <span className="atop__icon">{t.type === 'coffee' ? <Coffee size={14} strokeWidth={1.8} /> : <Shirt size={14} strokeWidth={1.8} />}</span>
                <span className="atop__name">{t.name}</span>
                <span className="atop__count">{t.count} {t.type === 'coffee' ? 'sold' : 'rehomed'}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
