import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Heart, Ruler, ShieldCheck, Truck } from 'lucide-react'
import { Page } from '../components/Reveal'
import SmartImage from '../components/SmartImage'
import ProductCard from '../components/ProductCard'
import SectionHead, { EmptyState } from '../components/SectionHead'
import { useLockBody, useMeta } from '../hooks'
import { useCatalog } from '../context/CatalogContext'
import { peso, cx } from '../lib/format'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'

const GALLERY_KINDS = ['tee', 'arch', 'stripe', 'stitch']

const CONDITION_NOTES = {
  10: 'Deadstock — unworn, tags on.',
  9: 'Excellent — barely worn, no flaws to name.',
  8: 'Very good — honest light wear, zero problems.',
  7: 'Good — visible wear and story, fully serviceable.',
}

export default function ShopProduct() {
  const { slug } = useParams()
  const { thriftBySlug, related, loading } = useCatalog()
  const product = thriftBySlug(slug)
  const { add } = useCart()
  const { has, toggle } = useFavorites()
  const [active, setActive] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  useLockBody(confirmOpen)

  useEffect(() => {
    if (!confirmOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setConfirmOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmOpen])

  useMeta({ title: product ? product.name : 'Not found', description: product?.short })

  if (loading) {
    return (
      <Page><div className="wrap section">
        <div className="sk sk--block" style={{ height: 420 }} />
      </div></Page>
    )
  }

  if (!product) {
    return (
      <Page><div className="wrap section">
        <EmptyState title="Piece not found" sub="It may have found a new home already." action={<Link to="/shop" className="btn btn--solid btn--sm">Back to shop</Link>} />
      </div></Page>
    )
  }

  const sold = product.status === 'sold'
  const fav = has(product.id)
  const suggestions = related(product, 4)
  const kinds = [product.ph.kind, ...GALLERY_KINDS.filter((k) => k !== product.ph.kind)].slice(0, 4)

  const handleAdd = () => {
    if (sold) return
    setConfirmOpen(true)
  }

  const confirmAdd = () => {
    setConfirmOpen(false)
    add({ product, options: { size: product.size, condition: `${product.condition}/10` } })
  }

  return (
    <Page>
      <div className="wrap section pdp pdp--thrift">
        <Link to="/shop" className="crumb"><ArrowLeft size={14} strokeWidth={2} /> Shop</Link>

        <div className="pdp__grid">
          <div className="pdp__gallery">
            <div className={cx('pdp__main ph-wrap', sold && 'is-sold')}>
              <SmartImage
                src={product.src}
                label={product.ph.label} tone={product.ph.tone} kind={kinds[active]}
                ratio="3/4" priority
              />
              {sold && <span className="pdp__soldmark">Sold</span>}
              {!sold && (
                <button
                  type="button"
                  className={cx('pdp__fav', fav && 'is-on')}
                  onClick={() => toggle(product)}
                  aria-label={fav ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <Heart size={17} strokeWidth={1.8} fill={fav ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
            <div className="pdp__thumbs">
              {kinds.map((k, i) => (
                <button
                  key={k}
                  type="button"
                  className={cx('pdp__thumb', active === i && 'is-active')}
                  onClick={() => setActive(i)}
                  aria-label={`View photo ${i + 1}`}
                >
                  <SmartImage label={product.ph.label} tone={product.ph.tone} kind={k} ratio="1/1" />
                </button>
              ))}
            </div>
          </div>

          <div className="pdp__info">
            <p className="eyebrow">Good Habits · {product.brand}</p>
            <h1 className="pdp__title">{product.name}</h1>
            <p className="pdp__price">{peso(product.price)}</p>

            <div className="pdp__specs">
              <div><span>Size</span><strong>{product.size}</strong></div>
              <div><span>Condition</span><strong>{product.condition}/10</strong></div>
              <div><span>Availability</span>
                <strong className={sold ? 'is-sold' : 'is-open'}>{sold ? 'Sold' : '1 available'}</strong>
              </div>
            </div>

            <p className="pdp__desc">{product.description}</p>
            <p className="pdp__condition"><ShieldCheck size={14} strokeWidth={2} /> {CONDITION_NOTES[product.condition]}</p>

            <div className="pdp__measures">
              <p className="eyebrow"><Ruler size={12} strokeWidth={2} /> Measurements <span className="opt__hint">laid flat</span></p>
              <dl>
                {Object.entries(product.measurements).map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
            </div>

            <div className="pdp__actions">
              {sold ? (
                <button type="button" className="btn btn--solid btn--full" disabled>Sold — one of one</button>
              ) : (
                <button type="button" className="btn btn--solid btn--full" onClick={handleAdd}>
                  Add to cart — {peso(product.price)}
                </button>
              )}
            </div>

            <ul className="pdp__perks">
              <li><Truck size={13} strokeWidth={2} /> Adding reserves this piece for 30 minutes</li>
              <li><ShieldCheck size={13} strokeWidth={2} /> Cleaned & steamed before pickup</li>
              <li>Free pickup in-store · Zamboanga City delivery ₱59</li>
            </ul>
          </div>
        </div>

        {confirmOpen && (
          <div
            className="confirm"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm add to cart"
            onClick={() => setConfirmOpen(false)}
          >
            <div className="confirm__panel" onClick={(e) => e.stopPropagation()}>
              <p className="eyebrow">One of one</p>
              <h3>Keep {product.name} for yourself?</h3>
              <p>Adding reserves this piece for 30 minutes. It can't be bought twice.</p>
              <div className="confirm__actions">
                <button type="button" className="btn btn--line btn--sm" onClick={() => setConfirmOpen(false)}>Not yet</button>
                <button type="button" className="btn btn--solid btn--sm" onClick={confirmAdd}>Yes, reserve it</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <section className="wrap section">
        <SectionHead eyebrow="Good Habits" title="You may also like" cta="Shop all" ctaTo="/shop" />
        <div className="pgrid pgrid--thrift">
          {suggestions.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>
    </Page>
  )
}
