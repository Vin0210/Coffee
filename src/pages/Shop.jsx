import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, Filter, RotateCcw, Search } from 'lucide-react'
import { PageHead, EmptyState } from '../components/SectionHead'
import { Page } from '../components/Reveal'
import ProductCard from '../components/ProductCard'
import { useMeta } from '../hooks'
import { thriftCategories, sizeOptions, conditionOptions, priceRanges } from '../data/thrift'
import { useCatalog } from '../context/CatalogContext'
import { cx } from '../lib/format'

const SORTS = [
  { value: 'new', label: 'Newest first' },
  { value: 'price-asc', label: 'Price · low to high' },
  { value: 'price-desc', label: 'Price · high to low' },
  { value: 'condition', label: 'Best condition' },
]

const initial = {
  q: '', category: 'all', size: 'all', condition: 0, brand: 'all', price: 'all', sort: 'new',
}

export default function Shop() {
  useMeta({ title: 'Shop Good Habits', description: 'Curated thrift — vintage denim, workwear, tees and accessories. One of each, first come first kept.' })
  const [params] = useSearchParams()
  const { thrift, loading } = useCatalog()
  const [f, setF] = useState({ ...initial, category: params.get('category') || 'all' })
  const [openFilters, setOpenFilters] = useState(false)

  const brands = useMemo(() => [...new Set(thrift.map((p) => p.brand))].sort(), [thrift])

  const items = useMemo(() => {
    let list = thrift.filter((p) => {
      if (f.q && ![p.name, p.brand, p.short].join(' ').toLowerCase().includes(f.q.toLowerCase())) return false
      if (f.category !== 'all' && p.category !== f.category) return false
      if (f.size !== 'all' && p.size !== f.size) return false
      if (f.condition && p.condition < f.condition) return false
      if (f.brand !== 'all' && p.brand !== f.brand) return false
      if (f.price !== 'all') {
        const r = priceRanges.find((r) => r.value === f.price)
        if (r && (p.price < r.min || p.price > r.max)) return false
      }
      return true
    })
    switch (f.sort) {
      case 'price-asc': list = [...list].sort((a, b) => a.price - b.price); break
      case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break
      case 'condition': list = [...list].sort((a, b) => b.condition - a.condition); break
      default: break
    }
    return list
  }, [f, thrift])

  const set = (patch) => setF((prev) => ({ ...prev, ...patch }))
  const isFiltered = JSON.stringify(f) !== JSON.stringify(initial)
  const available = items.filter((p) => p.status !== 'sold').length

  return (
    <Page>
      <PageHead
        eyebrow="Good Habits"
        title="Thrift & <em>Curated Pieces</em>"
        sub="Secondhand pieces with another life ahead. Hand-picked, cleaned, measured, and one of a kind."
      />

      <div className="shopbar">
        <div className="wrap shopbar__row">
          <label className="shopbar__search">
            <Search size={15} strokeWidth={1.8} />
            <input placeholder="Search pieces…" value={f.q} onChange={(e) => set({ q: e.target.value })} aria-label="Search pieces" />
          </label>
          <div className="shopbar__cats">
            <button type="button" className={cx('chip', f.category === 'all' && 'is-active')} onClick={() => set({ category: 'all' })}>All</button>
            {thriftCategories.map((c) => (
              <button key={c.slug} type="button" className={cx('chip', f.category === c.slug && 'is-active')} onClick={() => set({ category: c.slug })}>{c.name}</button>
            ))}
          </div>
          <button type="button" className={cx('shopbar__filter', openFilters && 'is-open')} onClick={() => setOpenFilters(!openFilters)} aria-expanded={openFilters}>
            <Filter size={15} strokeWidth={1.8} /> Filters {isFiltered && <span className="shopbar__dot" />}
          </button>
        </div>

        <div className={cx('wrap shopfilters', openFilters && 'is-open')}>
          <div className="shopfilters__group">
            <p className="shopfilters__label">Size</p>
            <div className="shopfilters__opts">
              <button type="button" className={cx('chip', f.size === 'all' && 'is-active')} onClick={() => set({ size: 'all' })}>Any</button>
              {sizeOptions.map((s) => (
                <button key={s} type="button" className={cx('chip', f.size === s && 'is-active')} onClick={() => set({ size: s })}>{s}</button>
              ))}
            </div>
          </div>
          <div className="shopfilters__group">
            <p className="shopfilters__label">Condition</p>
            <div className="shopfilters__opts">
              <button type="button" className={cx('chip', !f.condition && 'is-active')} onClick={() => set({ condition: 0 })}>Any</button>
              {conditionOptions.map((c) => (
                <button key={c.value} type="button" className={cx('chip', f.condition === c.value && 'is-active')} onClick={() => set({ condition: c.value })}>{c.label}</button>
              ))}
            </div>
          </div>
          <div className="shopfilters__group">
            <p className="shopfilters__label">Price</p>
            <div className="shopfilters__opts">
              <button type="button" className={cx('chip', f.price === 'all' && 'is-active')} onClick={() => set({ price: 'all' })}>Any</button>
              {priceRanges.map((r) => (
                <button key={r.value} type="button" className={cx('chip', f.price === r.value && 'is-active')} onClick={() => set({ price: r.value })}>{r.label}</button>
              ))}
            </div>
          </div>
          <div className="shopfilters__group">
            <p className="shopfilters__label">Brand & sort</p>
            <div className="shopfilters__selects">
              <div className="shopfilters__select">
                <select value={f.brand} onChange={(e) => set({ brand: e.target.value })} aria-label="Brand">
                  <option value="all">All brands</option>
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown size={14} />
              </div>
              <div className="shopfilters__select">
                <select value={f.sort} onChange={(e) => set({ sort: e.target.value })} aria-label="Sort">
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
          {isFiltered && (
            <button type="button" className="shopfilters__clear" onClick={() => setF(initial)}>
              <RotateCcw size={13} strokeWidth={2} /> Clear all
            </button>
          )}
        </div>
      </div>

      <section className="wrap section">
        <p className="shopbar__count">{loading ? 'Loading the racks…' : `${items.length} pieces · ${available} available`}</p>
        {loading ? (
          <div className="pgrid pgrid--thrift">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="sk sk--block" style={{ aspectRatio: '3/4' }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No pieces match that" sub="Loosen a filter or two — the racks turn over every week."
            action={isFiltered && <button type="button" className="btn btn--solid btn--sm" onClick={() => setF(initial)}>Clear filters</button>}
          />
        ) : (
          <div className="pgrid pgrid--thrift">
            {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} priority={i < 4} />)}
          </div>
        )}
      </section>
    </Page>
  )
}
