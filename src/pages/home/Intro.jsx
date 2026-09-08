import Reveal from '../../components/Reveal'

export default function Intro() {
  return (
    <section className="intro">
      <div className="wrap">
        <Reveal className="sec-head sec-head--center">
          <div className="sec-head__meta sec-head__meta--center">
            <span className="sec-head__no">(01)</span>
            <span className="sec-head__rule" />
            <span className="eyebrow">The Idea</span>
          </div>
          <h2 className="sec-head__title intro__title">
            Two sides of<br /><em>the same space.</em>
          </h2>
        </Reveal>

        <div className="intro__cols">
          <Reveal delay={0.05}>
            <p className="intro__label">Alegre</p>
            <p>
              Alegre is about coffee, conversation, and slowing down. Beans roasted for flavor,
              pulled by people who care, served without ceremony or rush.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="intro__label">Good Habits</p>
            <p>
              Good Habits is about finding pieces worth keeping. Every rack is curated by hand —
              one-of-one clothing with another life ahead of it.
            </p>
          </Reveal>
          <Reveal delay={0.19}>
            <p className="intro__label">Together</p>
            <p>
              Together, they create a space built around good things — the drink in your hand,
              the jacket on your chair, the people at the next table.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
