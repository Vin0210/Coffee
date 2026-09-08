import { Instagram } from 'lucide-react'
import SectionHead from '../../components/SectionHead'
import SmartImage from '../../components/SmartImage'
import Reveal from '../../components/Reveal'
import { socialPosts, BRAND } from '../../data/misc'

export default function SocialSection() {
  return (
    <section className="social">
      <div className="wrap">
        <SectionHead
          no="08"
          eyebrow="Community"
          title="Good people. <em>Good things.</em>"
          sub="Tag @alegrexgoodhabits — the best fits end up on the wall (and occasionally get a free cortado)."
          cta="Follow the brand"
          ctaTo={null}
        />

        <div className="social__grid">
          {socialPosts.map((p, i) => (
            <Reveal key={p.label} delay={i * 0.05} className="social__cell">
              <a href={BRAND.socials[0].href} target="_blank" rel="noreferrer" aria-label={`${p.label} on Instagram`}>
                <SmartImage src={p.src} label={p.label} tone={p.tone} kind={p.kind} ratio="1/1" />
                <span className="social__icon"><Instagram size={16} strokeWidth={1.8} /></span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="social__cta">
          <a className="btn btn--solid" href={BRAND.socials[0].href} target="_blank" rel="noreferrer">
            <Instagram size={15} strokeWidth={2} /> {BRAND.socials[0].handle}
          </a>
        </Reveal>
      </div>
    </section>
  )
}
