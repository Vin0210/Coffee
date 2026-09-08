import { useMemo, useState } from 'react'
import { PageHead, EmptyState } from '../components/SectionHead'
import { Page } from '../components/Reveal'
import ProductCard from '../components/ProductCard'
import { coffeeCategories } from '../data/coffee'
import { useCatalog } from '../context/CatalogContext'
import { useMeta } from '../hooks'
import { cx } from '../lib/format'

export default function Menu() {
  useMeta({ title: 'Coffee Menu', description: 'Espresso, milk coffee, cold coffee, specialty drinks, non-coffee and pastries — pulled to order at Alegre.' })
  const { coffee, loading } = useCatalog()
  const [cat, setCat] = useState('all')

  const items = useMemo(
    () => (cat === 'all' ? coffee : coffee.filter((p) => p.category === cat)),
    [cat, coffee]
  )

  const counts = useMemo(() => {
    const m = { all: coffee.length }
    coffeeCategories.forEach((c) => { m[c.slug] = coffee.filter((p) => p.category === c.slug).length })
    return m
  }, [coffee])

  return (
    <Page>
      <PageHead
        eyebrow="Alegre Coffee"
        title="The <em>Menu</em>"
        sub="Made slowly. Served simply. Prices include care — oat milk and extra shots are the only upgrades that cost."
      />

      <div className="filterbar">
        <div className="wrap filterbar__row" role="tablist" aria-label="Menu categories">
          <button type="button" role="tab" aria-selected={cat === 'all'} className={cx('chip', cat === 'all' && 'is-active')} onClick={() => setCat('all')}>
            All <sup>{counts.all}</sup>
          </button>
          {coffeeCategories.map((c) => (
            <button
              key={c.slug} type="button" role="tab" aria-selected={cat === c.slug}
              className={cx('chip', cat === c.slug && 'is-active')}
              onClick={() => setCat(c.slug)}
            >
              {c.name} <sup>{counts[c.slug]}</sup>
            </button>
          ))}
        </div>
      </div>

      <section className="wrap section">
        {loading ? (
          <div className="pgrid pgrid--coffee">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="sk sk--block" style={{ aspectRatio: '4/5' }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="Nothing in this category yet" sub="New drinks land with the season. Ask the bar what's brewing." />
        ) : (
          <div className="pgrid pgrid--coffee">
            {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} priority={i < 4} />)}
          </div>
        )}
      </section>
    </Page>
  )
}
