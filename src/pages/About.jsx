import { Link } from 'react-router-dom'
import { Page } from '../components/Reveal'
import SmartImage from '../components/SmartImage'
import Reveal from '../components/Reveal'
import { useMeta } from '../hooks'
import { BRAND } from '../data/misc'
import { Marquee } from '../components/SectionHead'

const VALUES = [
  { n: '01', t: 'Slow coffee', d: 'Beans sourced seasonally, roasted for flavor, and never rushed. If it takes ninety extra seconds, it is worth ninety seconds.' },
  { n: '02', t: 'Considered pieces', d: 'Every thrift item is chosen, cleaned, measured and photographed by hand. One of one — like you.' },
  { n: '03', t: 'Community first', d: 'Drops, swaps, DJs and workshops. The space exists so people have somewhere good to be.' },
  { n: '04', t: 'Honest prices', d: 'Fair to farmers, fair to finders. Premium without pretense.' },
]

export default function About() {
  useMeta({ title: 'About', description: 'Alegre × Good Habits — an independent coffee shop and curated thrift store in one space. Est. 2024, Tumaga - Putik Rd, Zamboanga City.' })

  return (
    <Page>
      <header className="about-hero">
        <div className="wrap">
          <Reveal><p className="eyebrow">Est. 2024 — Zamboanga City</p></Reveal>
          <Reveal delay={0.08}>
            <h1 className="about-hero__title">Good coffee, good finds,<br /><em>good habits.</em></h1>
          </Reveal>
        </div>
      </header>

      <div className="wrap">
        <Marquee items={['Alegre', 'Coffee & conversation', 'Good Habits', 'Pieces worth keeping', 'One space', 'Community']} />
      </div>

      <section className="wrap section about-story">
        <Reveal className="about-story__col">
          <p className="about-story__lead">
            We started with a simple idea: the best mornings involve both a great espresso
            <em> and</em> something good to wear while drinking it.
          </p>
        </Reveal>
        <Reveal className="about-story__col" delay={0.1}>
          <p>
            Alegre began as a two-group-head cart and a stubborn belief that specialty coffee
            should feel welcoming, not intimidating. Good Habits started as one rack of personally
            vouched-for vintage that kept selling out before noon.
          </p>
          <p>
            So we put them in one room. Now the regulars who come for the flat white leave with a
            chore coat, and the vintage hunters stay for the cold brew. Two businesses, one
            community, zero gatekeeping.
          </p>
        </Reveal>
      </section>

      <section className="wrap">
        <Reveal>
          <SmartImage src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80" label="The space" tone="espresso" kind="arch" ratio="21/9" className="about-hero__img" sizes="(max-width: 640px) 90vw, 80vw" />
        </Reveal>
      </section>

      <section className="wrap section about-stats">
        {[
          ['2024', 'The year it started'],
          ['1,200+', 'pieces rehomed'],
          ['40,000', 'espressos pulled (approx.)'],
          ['24', 'events hosted'],
        ].map(([n, l], i) => (
          <Reveal key={l} delay={i * 0.06} className="about-stat">
            <p className="about-stat__n">{n}</p>
            <p className="about-stat__l">{l}</p>
          </Reveal>
        ))}
      </section>

      <section className="wrap section">
        <Reveal className="sec-head">
          <div className="sec-head__meta"><span className="sec-head__no">(01)</span><span className="sec-head__rule" /><span className="eyebrow">What we believe</span></div>
        </Reveal>
        <div className="values">
          {VALUES.map((v, i) => (
            <Reveal key={v.n} delay={i * 0.06} className="value">
              <span className="value__no">{v.n}</span>
              <h3 className="value__t">{v.t}</h3>
              <p className="value__d">{v.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap section about-visit">
        <Reveal>
          <h2 className="about-visit__title">Come say hi.</h2>
          <p className="about-visit__addr">{BRAND.address}</p>
          <div className="about-visit__hours">
            {BRAND.hours.map((h) => <p key={h.day}><span>{h.day}</span> {h.time}</p>)}
          </div>
          <div className="about-visit__ctas">
            <Link to="/reservations" className="btn btn--solid btn--sm">Reserve a table</Link>
            <Link to="/events" className="btn btn--line btn--sm">See events</Link>
          </div>
        </Reveal>
      </section>
    </Page>
  )
}
