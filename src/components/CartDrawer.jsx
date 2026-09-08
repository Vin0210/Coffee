import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { peso } from '../lib/format'
import { phDataUri } from '../lib/placeholder'
import { resolveImage, buildSrcSet, imageForItem } from '../lib/images'
import { useCatalog } from '../context/CatalogContext'
import { ease } from './Reveal'
import QtyStepper from './QtyStepper'

function optionsText(item) {
  const o = item.options || {}
  if (item.type === 'thrift') {
    return [o.size ? `Size ${o.size}` : null, o.condition ? `${o.condition} condition` : null].filter(Boolean).join(' · ')
  }
  return [o.size, o.milk, o.sugar ? `${o.sugar} sugar` : null, (o.addons || []).join(', ')]
    .filter(Boolean).join(' · ')
}

export default function CartDrawer() {
  const { items, isOpen, setOpen, setQty, remove, subtotal, count } = useCart()
  const { allProducts } = useCatalog()
  const byId = (id) => allProducts().find((p) => p.id === id || p.slug === id)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="drawer-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="drawer"
            role="dialog" aria-modal="true" aria-label="Shopping cart"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease }}
          >
            <header className="drawer__head">
              <h2>Cart <sup>({count})</sup></h2>
              <button type="button" className="nav__icon" aria-label="Close cart" onClick={() => setOpen(false)}>
                <X size={20} strokeWidth={1.8} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="drawer__empty">
                <p className="empty__mark" aria-hidden="true">×</p>
                <p>Nothing here yet — good things await.</p>
                <div className="drawer__empty-ctas">
                  <Link to="/menu" className="btn btn--line btn--sm" onClick={() => setOpen(false)}>Order coffee</Link>
                  <Link to="/shop" className="btn btn--solid btn--sm" onClick={() => setOpen(false)}>Shop finds</Link>
                </div>
              </div>
            ) : (
              <>
                <ul className="drawer__items">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.lineId}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={{ duration: 0.3, ease }}
                      >
                        <div className="cline">
                          <Link to={item.type === 'thrift' ? `/shop/${item.slug}` : `/menu/${item.slug}`} onClick={() => setOpen(false)}>
                            {(() => {
                              const real = imageForItem(item, byId) || resolveImage(item.src)
                              const fallback = phDataUri({ label: item.ph?.label || item.name, tone: item.ph?.tone || 'sand', kind: item.ph?.kind || 'arch' })
                              const srcSet = item.src ? buildSrcSet(item.src) : undefined
                              return (
                                <img
                                  className="cline__img"
                                  src={real || fallback}
                                  srcSet={real && srcSet ? srcSet : undefined}
                                  sizes={real && srcSet ? '80px' : undefined}
                                  alt={item.name}
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => { if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback }}
                                />
                              )
                            })()}
                          </Link>
                          <div className="cline__main">
                            <div className="cline__top">
                              <p className="cline__name">{item.name}</p>
                              <button type="button" className="cline__rm" aria-label={`Remove ${item.name}`} onClick={() => remove(item.lineId)}>
                                <X size={14} strokeWidth={2} />
                              </button>
                            </div>
                            <p className="cline__opts">{optionsText(item) || (item.type === 'coffee' ? 'Barista’s choice' : 'One of one')}</p>
                            <div className="cline__bottom">
                              {item.type === 'coffee' ? (
                                <QtyStepper small value={item.qty} onChange={(q) => setQty(item.lineId, q)} />
                              ) : (
                                <span className="cline__one">One of one</span>
                              )}
                              <span className="cline__price">{peso(item.price * item.qty)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="drawer__foot">
                  <div className="drawer__total">
                    <span>Subtotal</span>
                    <strong>{peso(subtotal)}</strong>
                  </div>
                  <p className="drawer__note">Pickup is free. Delivery ₱59 — chosen at checkout.</p>
                  <Link to="/checkout" className="btn btn--solid btn--full" onClick={() => setOpen(false)}>
                    Checkout <ArrowRight size={15} strokeWidth={2} />
                  </Link>
                  <button type="button" className="drawer__continue" onClick={() => setOpen(false)}>
                    Keep browsing
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
