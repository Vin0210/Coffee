import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Reveal from './Reveal'

/** Numbered editorial section header: (01) ─── EYEBROW / Serif title / link */
export default function SectionHead({ no, eyebrow, title, sub, cta, ctaTo, dark = false, center = false }) {
  return (
    <Reveal className={`sec-head ${dark ? 'sec-head--dark' : ''} ${center ? 'sec-head--center' : ''}`}>
      <div className="sec-head__meta">
        {no && <span className="sec-head__no">({no})</span>}
        <span className="sec-head__rule" />
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        {cta && ctaTo && (
          <Link className="sec-head__cta" to={ctaTo}>
            {cta} <ArrowUpRight size={13} strokeWidth={2.2} />
          </Link>
        )}
      </div>
      {title && <h2 className="sec-head__title" dangerouslySetInnerHTML={{ __html: title }} />}
      {sub && <p className="sec-head__sub">{sub}</p>}
    </Reveal>
  )
}

/** Inner-page header: eyebrow + big serif title + optional sub */
export function PageHead({ eyebrow, title, sub, children }) {
  return (
    <header className="page-head">
      <div className="wrap">
        {eyebrow && <Reveal><p className="eyebrow page-head__eyebrow">{eyebrow}</p></Reveal>}
        {title && (
          <Reveal delay={0.06}>
            {typeof title === 'string'
              ? <h1 className="page-head__title" dangerouslySetInnerHTML={{ __html: title }} />
              : <h1 className="page-head__title">{title}</h1>}
          </Reveal>
        )}
        {sub && <Reveal delay={0.12}><p className="page-head__sub">{sub}</p></Reveal>}
        {children}
      </div>
    </header>
  )
}

/** Infinite ticker strip */
export function Marquee({ items, dark = false, className = '' }) {
  const row = [...items, ...items, ...items]
  return (
    <div className={`marquee ${dark ? 'marquee--dark' : ''} ${className}`} aria-hidden="true">
      <div className="marquee__track">
        {row.map((item, i) => (
          <span className="marquee__item" key={i}>
            {item} <span className="marquee__x">×</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/** Empty state block */
export function EmptyState({ title, sub, action }) {
  return (
    <div className="empty">
      <p className="empty__mark" aria-hidden="true">×</p>
      <h3 className="empty__title">{title}</h3>
      {sub && <p className="empty__sub">{sub}</p>}
      {action}
    </div>
  )
}
