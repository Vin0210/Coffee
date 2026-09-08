import { ArrowUpRight } from 'lucide-react'
import SectionHead from '../../components/SectionHead'
import SmartImage from '../../components/SmartImage'
import Reveal from '../../components/Reveal'
import { spaceGallery } from '../../data/misc'

export default function SpaceSection() {
  return (
    <section className="space">
      <div className="wrap">
        <SectionHead
          no="06"
          eyebrow="Our Space"
          title="Come for the coffee.<br /><em>Stay for the finds.</em>"
          sub="One room in Poblacion — espresso machine on the left, racks on the right, and everyone in between."
          cta="Plan a visit"
          ctaTo="/reservations"
        />

        <div className="sgrid">
          {spaceGallery.map((g, i) => (
            <Reveal key={g.label} delay={Math.min(i * 0.04, 0.2)} className={`sgrid__item sgrid__item--${i}`}>
              <figure>
                <SmartImage src={g.src} label={g.label} tone={g.tone} kind={g.kind} ratio={g.ratio} />
                <figcaption>{g.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal className="space__visit">
          <div>
            <p className="eyebrow">Find us</p>
            <p className="space__addr">Tumaga - Putik Rd, Zamboanga City</p>
          </div>
          <a className="btn btn--line btn--sm" href="https://maps.google.com" target="_blank" rel="noreferrer">
            Open in maps <ArrowUpRight size={14} strokeWidth={2} />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
