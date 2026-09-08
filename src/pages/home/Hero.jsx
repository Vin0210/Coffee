import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import SmartImage from '../../components/SmartImage'
import { Marquee } from '../../components/SectionHead'
import { ease } from '../../components/Reveal'

const rise = (delay) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease },
})

function Badge() {
  return (
    <div className="hero__badge" aria-hidden="true">
      <svg viewBox="0 0 120 120" className="hero__badge-svg">
        <defs>
          <path id="badge-circ" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
        </defs>
        <text className="hero__badge-text">
          <textPath href="#badge-circ">COFFEE · CLOTHES · GOOD HABITS · EST 2024 ·</textPath>
        </text>
      </svg>
      <span className="hero__badge-x">×</span>
    </div>
  )
}

export default function Hero() {
  const { scrollY } = useScroll()
  const yArt = useTransform(scrollY, [0, 700], [0, 70])
  const yBadge = useTransform(scrollY, [0, 700], [0, -50])

  return (
    <section className="hero">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <motion.p className="eyebrow hero__eyebrow" {...rise(0.05)}>
            Est. 2024 — Zamboanga City
          </motion.p>
          <motion.h1 className="hero__title" {...rise(0.14)}>
            <span className="hero__line">Alegre <span className="hero__times">×</span></span>
            <span className="hero__line"><em>Good Habits</em></span>
          </motion.h1>
          <motion.p className="hero__tag" {...rise(0.24)}>Coffee. Clothes. Good Habits.</motion.p>
          <motion.p className="hero__sub" {...rise(0.3)}>
            Specialty coffee and carefully chosen pieces for everyday life.
          </motion.p>
          <motion.div className="hero__ctas" {...rise(0.38)}>
            <Link to="/menu" className="btn btn--solid">Order Coffee <ArrowRight size={15} strokeWidth={2} /></Link>
            <Link to="/shop" className="btn btn--line">Shop Good Habits <ArrowUpRight size={15} strokeWidth={2} /></Link>
          </motion.div>
        </div>

        <div className="hero__art">
          <motion.div className="hero__art-main" style={{ y: yArt }} {...rise(0.2)}>
            <SmartImage
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80"
              label="Morning espresso"
              tone="espresso"
              kind="cup"
              ratio="3/4"
              priority
              sizes="(max-width: 640px) 90vw, 40vw"
            />
          </motion.div>
          <motion.div className="hero__art-over" style={{ y: yBadge }} {...rise(0.34)}>
            <SmartImage
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80"
              label="The racks"
              tone="olive"
              kind="tee"
              ratio="4/5"
              sizes="(max-width: 640px) 60vw, 25vw"
            />
          </motion.div>
          <motion.div className="hero__badge-wrap" style={{ y: yBadge }} {...rise(0.5)}>
            <Badge />
          </motion.div>
          <motion.p className="hero__caption" {...rise(0.6)}>
            One space, two obsessions — <em>slow coffee</em> & one-of-one clothing.
          </motion.p>
        </div>
      </div>

      <motion.div {...rise(0.55)}>
        <Marquee
          items={['Single origin espresso', 'Vintage denim', 'Slow mornings', 'One-of-one finds', 'Ceremonial matcha', 'Good company', 'Pour overs', 'Drop 04 friday']}
        />
      </motion.div>
    </section>
  )
}
