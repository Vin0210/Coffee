import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import SectionHead from '../../components/SectionHead'
import Countdown, { dropTarget } from '../../components/Countdown'
import Reveal from '../../components/Reveal'
import SmartImage from '../../components/SmartImage'
import { useCatalog } from '../../context/CatalogContext'
import { peso } from '../../lib/format'
import { DROP } from '../../data/misc'

export default function DropSection() {
  const { dropItems, loading } = useCatalog()
  const pieces = dropItems().slice(0, 3)

  return (
    <section className="drop">
      <div className="wrap">
        <SectionHead
          no="04"
          eyebrow="Limited Release"
          title="The Next <em>Drop</em>"
          sub="One rack. One night. Forty pieces that will not be restocked."
          dark
        />

        <div className="drop__grid">
          <Reveal className="drop__info">
            <p className="drop__no">DROP {DROP.number}</p>
            <Countdown target={dropTarget()} />
            <Link to="/shop" className="btn btn--cream drop__cta">
              View Drop <ArrowUpRight size={15} strokeWidth={2} />
            </Link>
            <p className="drop__hint">Doors 7PM · in-store & online · first come, first kept</p>
          </Reveal>

          <div className="drop__pieces">
            {loading ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="sk sk--block" style={{ aspectRatio: '3/4' }} />
              ))
            ) : (
              pieces.map((p, i) => (
                <Reveal key={p.id} delay={0.1 + i * 0.08}>
                  <Link to={`/shop/${p.slug}`} className="drop__piece">
                    <SmartImage src={p.src} label={p.ph.label} tone={p.ph.tone} kind={p.ph.kind} ratio="3/4" />
                    <span className="drop__piece-tag">Drop {DROP.number}</span>
                    <span className="drop__piece-info">
                      <span className="drop__piece-name">{p.name}</span>
                      <span className="drop__piece-price">{peso(p.price)} · Size {p.size}</span>
                    </span>
                  </Link>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
