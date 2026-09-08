import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Plus } from 'lucide-react'
import SectionHead from '../../components/SectionHead'
import SmartImage from '../../components/SmartImage'
import Reveal, { ease } from '../../components/Reveal'
import { useCatalog } from '../../context/CatalogContext'
import { peso } from '../../lib/format'
import { useCart } from '../../context/CartContext'

/** Signature feature — coffee × clothes pairings */
export default function PairsSection() {
  const [activeId, setActiveId] = useState('p1')
  const { add } = useCart()
  const { pairById, loading } = useCatalog()
  const pair = pairById(activeId)
  const ready = pair?.coffeeProduct && pair?.thriftProduct

  const addPair = () => {
    if (!ready) return
    add({
      product: { ...pair.coffeeProduct, type: 'coffee' },
      options: { size: pair.coffeeProduct.sizes?.[0]?.label || null, milk: null, sugar: '50%', addons: [] },
      silent: true,
    })
    // drawer opens on first add; second add happens right after
    add({ product: { ...pair.thriftProduct, type: 'thrift' }, options: { size: pair.thriftProduct.size, condition: `${pair.thriftProduct.condition}/10` } })
  }

  return (
    <section className="pairs">
      <div className="wrap">
        <SectionHead
          no="05"
          eyebrow="Better Together"
          title="Coffee <em>×</em> Clothes"
          sub="Our signature ritual — a drink and a piece that belong together. Pick a pairing, take both home."
        />

        <div className="pairs__grid">
          <Reveal className="pairs__list" role="tablist" aria-label="Pairings">
            {[['p1', 'Iced Spanish Latte × Vintage Denim'], ['p2', 'Cold Brew × Workwear Jacket'], ['p3', 'Matcha × Graphic Tee']].map(([id, label], i) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={id === activeId}
                className={`pairs__tab ${id === activeId ? 'is-active' : ''}`}
                onClick={() => setActiveId(id)}
              >
                <span className="pairs__tab-no">0{i + 1}</span>
                <span>{label}</span>
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </button>
            ))}
          </Reveal>

          <div className="pairs__stage">
            {loading || !ready ? (
              <div className="pairs__stage-inner">
                <div className="sk sk--block" style={{ aspectRatio: '4/5' }} />
                <span className="pairs__x" aria-hidden="true">×</span>
                <div className="sk sk--block" style={{ aspectRatio: '4/5' }} />
              </div>
            ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={pair.id}
                className="pairs__stage-inner"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease }}
              >
                <Link className="pairs__card" to={`/menu/${pair.coffeeProduct.slug}`}>
                  <SmartImage src={pair.coffeeProduct.src} label={pair.coffeeProduct.ph.label} tone={pair.coffeeProduct.ph.tone} kind={pair.coffeeProduct.ph.kind} ratio="4/5" />
                  <span className="pairs__card-kicker">Alegre</span>
                  <span className="pairs__card-name">{pair.coffeeProduct.name}</span>
                  <span className="pairs__card-price">{peso(pair.coffeeProduct.price)}</span>
                </Link>

                <span className="pairs__x" aria-hidden="true">×</span>

                <Link className="pairs__card" to={`/shop/${pair.thriftProduct.slug}`}>
                  <SmartImage src={pair.thriftProduct.src} label={pair.thriftProduct.ph.label} tone={pair.thriftProduct.ph.tone} kind={pair.thriftProduct.ph.kind} ratio="4/5" />
                  <span className="pairs__card-kicker">Good Habits</span>
                  <span className="pairs__card-name">{pair.thriftProduct.name}</span>
                  <span className="pairs__card-price">{peso(pair.thriftProduct.price)}</span>
                </Link>
              </motion.div>
            </AnimatePresence>
            )}

            {ready && (
            <div className="pairs__foot">
              <p className="pairs__note">{pair.note}</p>
              <button type="button" className="btn btn--solid btn--sm" onClick={addPair}>
                <Plus size={14} strokeWidth={2.4} /> Add the pair — {peso(pair.coffeeProduct.price + pair.thriftProduct.price)}
              </button>
            </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
