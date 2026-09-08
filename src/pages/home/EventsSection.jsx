import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, MapPin } from 'lucide-react'
import SectionHead from '../../components/SectionHead'
import Reveal from '../../components/Reveal'
import { fmtDay, fmtDayNum, fmtMonth } from '../../lib/format'
import { useCatalog } from '../../context/CatalogContext'

export default function EventsSection() {
  const { upcomingEvents, loading } = useCatalog()
  const items = upcomingEvents().slice(0, 4)

  if (loading) {
    return (
      <section className="home-events">
        <div className="wrap">
          <div className="elist">
            {[0, 1, 2].map((i) => (
              <div key={i} className="sk sk--block" style={{ height: 120 }} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="home-events">
      <div className="wrap">
        <SectionHead
          no="07"
          eyebrow="Calendar"
          title="Something always<br /><em>happening here.</em>"
          sub="Drops, DJs, workshops and swaps — the room changes weekly."
          cta="View events"
          ctaTo="/events"
        />

        <div className="elist">
          {items.map((e, i) => (
            <Reveal key={e.slug} delay={i * 0.05}>
              <Link to="/events" className="elist__row">
                <div className="elist__date">
                  <span className="elist__day">{fmtDayNum(e.date)}</span>
                  <span className="elist__mon">{fmtMonth(e.date)} · {fmtDay(e.date)}</span>
                </div>
                <div className="elist__main">
                  <h3 className="elist__title">{e.title}</h3>
                  <p className="elist__desc">{e.description}</p>
                  <p className="elist__meta"><MapPin size={12} strokeWidth={2} /> {e.location} · {e.time}</p>
                </div>
                <span className="elist__cta">Details <ArrowUpRight size={15} strokeWidth={2} /></span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="home-events__cta">
          <Link to="/events" className="btn btn--line">All Events <ArrowRight size={15} strokeWidth={2} /></Link>
        </Reveal>
      </div>
    </section>
  )
}
