import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCatalog } from '../context/CatalogContext'
import { peso } from '../lib/format'
import { phDataUri } from '../lib/placeholder'
import { resolveImage, buildSrcSet } from '../lib/images'
import { ease } from './Reveal'

export default function SearchOverlay({ onClose, onGo }) {
  const [q, setQ] = useState('')
  const inputRef = useRef(null)
  const { searchAll } = useCatalog()
  const results = searchAll(q)

  useEffect(() => { inputRef.current?.focus() }, [])

  return (
    <motion.div
      className="search"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog" aria-modal="true" aria-label="Search"
    >
      <div className="wrap search__inner">
        <div className="search__bar">
          <Search size={22} strokeWidth={1.6} className="search__icon" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) onGo(results[0].type === 'thrift' ? `/shop/${results[0].slug}` : `/menu/${results[0].slug}`)
            }}
            placeholder="Search coffee & clothes…"
            aria-label="Search coffee and clothes"
          />
          <button type="button" className="nav__icon" aria-label="Close search" onClick={onClose}>
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        {q.trim() === '' ? (
          <div className="search__hint">
            <p className="eyebrow">Try</p>
            <div className="search__chips">
              {['Spanish latte', 'denim', 'matcha', 'carhartt', 'cold brew'].map((s) => (
                <button key={s} type="button" className="chip" onClick={() => setQ(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <p className="search__none">Nothing found for “{q}”. Try “latte”, “denim” or “vintage”.</p>
        ) : (
          <ul className="search__results">
            {results.map((p, i) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease }}
              >
                <button
                  type="button"
                  className="search__row"
                  onClick={() => onGo(p.type === 'thrift' ? `/shop/${p.slug}` : `/menu/${p.slug}`)}
                >
                  <img
                    src={resolveImage(p.src) || phDataUri({ label: p.ph.label, tone: p.ph.tone, kind: p.ph.kind })}
                    srcSet={p.src ? buildSrcSet(p.src) : undefined}
                    sizes={p.src ? '52px' : undefined}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="search__row-main">
                    <span className="search__row-name">{p.name}</span>
                    <span className="search__row-meta">
                      {p.type === 'thrift' ? `${p.brand} · Size ${p.size} · ${p.condition}/10` : 'Alegre Coffee'}
                    </span>
                  </span>
                  <span className="search__row-price">{peso(p.price)}</span>
                  <ArrowUpRight size={16} strokeWidth={1.8} />
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  )
}
