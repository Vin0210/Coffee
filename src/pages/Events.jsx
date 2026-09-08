import { ArrowUpRight, Clock, MapPin, Users } from 'lucide-react'
import { Page } from '../components/Reveal'
import { PageHead, EmptyState } from '../components/SectionHead'
import SmartImage from '../components/SmartImage'
import Reveal from '../components/Reveal'
import { useMeta } from '../hooks'
import { useCatalog } from '../context/CatalogContext'
import { useToast } from '../context/ToastContext'
import { fmtDayNum, fmtMonth, fmtDay, fmtDate } from '../lib/format'
import { BRAND } from '../data/misc'

export default function Events() {
  useMeta({ title: 'Events', description: 'Thrift drops, DJ nights, coffee workshops, pop-up markets and clothing swaps at Alegre × Good Habits.' })
  const { toast } = useToast()
  const { upcomingEvents, pastEvents, loading } = useCatalog()
  const upcoming = upcomingEvents()
  const past = pastEvents()

  const rsvp = (e) => toast(`RSVP received for ${e.title} — see you there!`)

  return (
    <Page>
      <PageHead
        eyebrow="Calendar"
        title="Events & <em>Happenings</em>"
        sub="The room changes weekly — drops, DJs, workshops, swaps. Espresso bar stays open through all of it."
      />

      <section className="wrap section">
        {loading ? (
          <div className="events__list">
            {[0, 1].map((i) => (
              <div key={i} className="sk sk--block" style={{ height: 280 }} />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <EmptyState title="Nothing scheduled yet" sub="Follow the socials — announcements drop first there." />
        ) : (
          <div className="events__list">
            {upcoming.map((e, i) => (
              <Reveal key={e.slug} delay={i * 0.05}>
                <article className="event">
                  <div className="event__date">
                    <span className="event__day">{fmtDayNum(e.date)}</span>
                    <span className="event__mon">{fmtMonth(e.date)}</span>
                    <span className="event__dow">{fmtDay(e.date)}</span>
                  </div>
                  <div className="event__media">
                    <SmartImage src={e.src} label={e.title} tone={e.ph.tone} kind={e.ph.kind} ratio="16/10" sizes="(max-width: 640px) 90vw, 50vw" />
                  </div>
                  <div className="event__body">
                    <h2 className="event__title">{e.title}</h2>
                    <p className="event__desc">{e.description}</p>
                    <div className="event__meta">
                      <span><Clock size={13} strokeWidth={2} /> {e.time}</span>
                      <span><MapPin size={13} strokeWidth={2} /> {e.location}</span>
                      <span><Users size={13} strokeWidth={2} /> {e.slots}</span>
                    </div>
                    <div className="event__actions">
                      <button type="button" className="btn btn--solid btn--sm" onClick={() => rsvp(e)}>RSVP</button>
                      <button type="button" className="btn btn--line btn--sm" onClick={() => toast('Added to your calendar-ish. See you there!')}>Remind me</button>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="wrap section past-events">
          <p className="eyebrow">Past nights</p>
          <ul className="past-events__list">
            {past.map((e) => (
              <li key={e.slug} className="past-events__row">
                <span className="past-events__date">{fmtDate(e.date)}</span>
                <span className="past-events__title">{e.title}</span>
                <span className="past-events__desc">{e.description}</span>
                <span className="past-events__tag">Recap</span>
              </li>
            ))}
          </ul>
          <a className="btn btn--line btn--sm" href={BRAND.socials[0].href} target="_blank" rel="noreferrer">
            Photo recaps on Instagram <ArrowUpRight size={14} strokeWidth={2} />
          </a>
        </section>
      )}
    </Page>
  )
}
