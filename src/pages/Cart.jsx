import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Page } from '../components/Reveal'
import { PageHead, EmptyState } from '../components/SectionHead'
import QtyStepper from '../components/QtyStepper'
import { useCart } from '../context/CartContext'
import { useMeta } from '../hooks'
import { peso } from '../lib/format'
import { phDataUri } from '../lib/placeholder'
import { resolveImage, buildSrcSet, imageForItem } from '../lib/images'
import { useCatalog } from '../context/CatalogContext'

function optionsText(item) {
  const o = item.options || {}
  if (item.type === 'thrift') {
    return [o.size ? `Size ${o.size}` : null, o.condition ? `${o.condition} condition` : null].filter(Boolean).join(' · ')
  }
  return [o.size, o.milk, o.sugar ? `${o.sugar} sugar` : null, (o.addons || []).join(', ')]
    .filter(Boolean).join(' · ')
}

export default function Cart() {
  useMeta({ title: 'Cart' })
  const { items, setQty, remove, subtotal, clear } = useCart()
  const { allProducts } = useCatalog()
  const byId = (id) => allProducts().find((p) => p.id === id || p.slug === id)
  const thumb = (item) => {
    const real = imageForItem(item, byId) || resolveImage(item.src)
    const fallback = phDataUri({ label: item.ph?.label || item.name, tone: item.ph?.tone || 'sand', kind: item.ph?.kind || 'arch' })
    return { real, fallback, srcSet: item.src ? buildSrcSet(item.src) : undefined }
  }

  return (
    <Page>
      <PageHead eyebrow="Your picks" title={<>Cart <em className="cart-count">({items.reduce((n, i) => n + i.qty, 0)})</em></>} />

      <div className="wrap section">
        {items.length === 0 ? (
          <EmptyState
            title="Your cart is empty" sub="Good things await — a drink for now, a piece for keeps."
            action={
              <div className="empty__ctas">
                <Link to="/menu" className="btn btn--line btn--sm">Order coffee</Link>
                <Link to="/shop" className="btn btn--solid btn--sm">Shop finds</Link>
              </div>
            }
          />
        ) : (
          <div className="cartpage">
            <ul className="cartpage__list">
              {items.map((item) => (
                <li key={item.lineId} className="cline cline--page">
                  {(() => {
                    const t = thumb(item)
                    return (
                      <img
                        className="cline__img"
                        src={t.real || t.fallback}
                        srcSet={t.real && t.srcSet ? t.srcSet : undefined}
                        sizes={t.real && t.srcSet ? '120px' : undefined}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { if (e.currentTarget.src !== t.fallback) e.currentTarget.src = t.fallback }}
                      />
                    )
                  })()}
                  <div className="cline__main">
                    <div className="cline__top">
                      <p className="cline__name">
                        {item.type === 'thrift'
                          ? <Link to={`/shop/${item.slug}`}>{item.name}</Link>
                          : <Link to={`/menu/${item.slug}`}>{item.name}</Link>}
                      </p>
                      <span className="cline__type">{item.type === 'thrift' ? 'Good Habits' : 'Alegre'}</span>
                      <button type="button" className="cline__rm" aria-label={`Remove ${item.name}`} onClick={() => remove(item.lineId)}>Remove</button>
                    </div>
                    <p className="cline__opts">{optionsText(item) || 'Barista’s choice'}</p>
                    <div className="cline__bottom">
                      {item.type === 'coffee'
                        ? <QtyStepper small value={item.qty} onChange={(q) => setQty(item.lineId, q)} />
                        : <span className="cline__one">One of one</span>}
                      <span className="cline__price">{peso(item.price * item.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="cartpage__summary">
              <h3 className="cartpage__head">Summary</h3>
              <div className="cartpage__row"><span>Subtotal</span><strong>{peso(subtotal)}</strong></div>
              <div className="cartpage__row"><span>Pickup</span><strong>Free</strong></div>
              <div className="cartpage__row cartpage__row--muted"><span>Delivery</span><span>₱59 — chosen at checkout</span></div>
              <div className="cartpage__row cartpage__row--total"><span>Total</span><strong>{peso(subtotal)}</strong></div>
              <Link to="/checkout" className="btn btn--solid btn--full">Checkout <ArrowRight size={15} strokeWidth={2} /></Link>
              <button type="button" className="cartpage__clear" onClick={clear}>Empty cart</button>
            </aside>
          </div>
        )}
      </div>
    </Page>
  )
}
