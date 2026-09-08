import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Page } from '../components/Reveal'
import SmartImage from '../components/SmartImage'
import ProductCard from '../components/ProductCard'
import SectionHead, { EmptyState } from '../components/SectionHead'
import QtyStepper from '../components/QtyStepper'
import { useMeta } from '../hooks'
import { useCatalog } from '../context/CatalogContext'
import { coffeeCategories, MILK_EXTRA } from '../data/coffee'
import { peso, cx } from '../lib/format'
import { useCart } from '../context/CartContext'

const SUGAR = ['0%', '25%', '50%', '75%', '100%']
const GALLERY_KINDS = ['cup', 'arch', 'rings']

export default function MenuProduct() {
  const { slug } = useParams()
  const { coffeeBySlug, related, pairFor, loading } = useCatalog()
  const product = coffeeBySlug(slug)
  const { add } = useCart()

  const [size, setSize] = useState(product?.sizes?.[0]?.label ?? null)
  const [milk, setMilk] = useState(product?.milks?.[0] ?? null)
  const [sugar, setSugar] = useState('50%')
  const [addons, setAddons] = useState([])
  const [qty, setQty] = useState(1)
  const [shot, setShot] = useState(0)

  useMeta({ title: product ? product.name : 'Not found', description: product?.short })

  const unit = useMemo(() => {
    if (!product) return 0
    let v = product.price
    v += product.sizes?.find((s) => s.label === size)?.delta || 0
    v += milk && milk !== 'Whole' && milk !== 'None' ? MILK_EXTRA : 0
    v += shot * 35
    v += addons.reduce((n, label) => n + (product.addons.find((a) => a.label === label)?.price || 0), 0)
    return v
  }, [product, size, milk, addons, shot])

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
        <EmptyState title="Drink not found" sub="It may have rotated off the menu." action={<Link to="/menu" className="btn btn--solid btn--sm">Back to menu</Link>} />
      </div></Page>
    )
  }

  const catName = coffeeCategories.find((c) => c.slug === product.category)?.name
  const pair = pairFor(product.slug)
  const suggestions = related(product, 4)
  const options = { size, milk, sugar: product.sugar ? sugar : null, addons }
  const toggleAddon = (label) =>
    setAddons((a) => (a.includes(label) ? a.filter((x) => x !== label) : [...a, label]))

  return (
    <Page>
      <div className="wrap section pdp">
        <Link to="/menu" className="crumb"><ArrowLeft size={14} strokeWidth={2} /> Full menu</Link>

        <div className="pdp__grid">
          <div className="pdp__gallery">
            <SmartImage src={product.src} label={product.ph.label} tone={product.ph.tone} kind={product.ph.kind} ratio="4/5" priority />
            <div className="pdp__thumbs">
              {GALLERY_KINDS.map((k) => (
                <SmartImage key={k} label={product.ph.label} tone={product.ph.tone} kind={k} ratio="1/1" />
              ))}
            </div>
          </div>

          <div className="pdp__info">
            <p className="eyebrow">Alegre · {catName}</p>
            <h1 className="pdp__title">{product.name}</h1>
            <p className="pdp__price">{peso(unit)}<span className="pdp__each"> / {qty > 1 ? `${qty} pcs` : 'each'}</span></p>
            <p className="pdp__desc">{product.description}</p>

            {product.sizes && (
              <fieldset className="opt">
                <legend className="opt__label">Size</legend>
                <div className="opt__chips">
                  {product.sizes.map((s) => (
                    <button key={s.label} type="button" className={cx('chip', size === s.label && 'is-active')} onClick={() => setSize(s.label)}>
                      {s.label}{s.delta ? ` +${peso(s.delta)}` : ''}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {product.milks && (
              <fieldset className="opt">
                <legend className="opt__label">Milk <span className="opt__hint">Oat & almond +{peso(MILK_EXTRA)}</span></legend>
                <div className="opt__chips">
                  {product.milks.map((m) => (
                    <button key={m} type="button" className={cx('chip', milk === m && 'is-active')} onClick={() => setMilk(m)}>{m}</button>
                  ))}
                </div>
              </fieldset>
            )}

            {product.sugar && (
              <fieldset className="opt">
                <legend className="opt__label">Sugar</legend>
                <div className="opt__chips">
                  {SUGAR.map((s) => (
                    <button key={s} type="button" className={cx('chip', sugar === s && 'is-active')} onClick={() => setSugar(s)}>{s}</button>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset className="opt">
              <legend className="opt__label">Add-ons</legend>
              <div className="opt__addons">
                <button type="button" className={cx('addon', shot > 0 && 'is-active')} onClick={() => setShot(shot > 0 ? 0 : 1)}>
                  <span className="addon__check">{shot > 0 && <Check size={11} strokeWidth={3} />}</span>
                  Extra espresso shot <em>+{peso(35)}</em>
                </button>
                {product.addons.filter((a) => a.label !== 'Extra shot').map((a) => (
                  <button key={a.label} type="button" className={cx('addon', addons.includes(a.label) && 'is-active')} onClick={() => toggleAddon(a.label)}>
                    <span className="addon__check">{addons.includes(a.label) && <Check size={11} strokeWidth={3} />}</span>
                    {a.label} <em>+{peso(a.price)}</em>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="pdp__actions">
              <QtyStepper value={qty} onChange={setQty} />
              <button type="button" className="btn btn--solid btn--full" onClick={() => add({ product, qty, options })}>
                Add to cart — {peso(unit * qty)} <ArrowRight size={15} strokeWidth={2} />
              </button>
            </div>

            {product.notes && (
              <div className="pdp__notes">
                <p className="eyebrow">Origin & tasting notes</p>
                <p>{product.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {pair && pair.coffeeProduct.slug === product.slug && (
        <section className="wrap section pdp__pair">
          <SectionHead eyebrow="Better together" title={`Pairs with <em>${pair.thriftProduct.name}</em>`} sub={pair.note} center />
          <div className="pdp__pair-cta">
            <Link to={`/shop/${pair.thriftProduct.slug}`} className="btn btn--line">See the piece</Link>
          </div>
        </section>
      )}

      <section className="wrap section">
        <SectionHead eyebrow="More from the menu" title="You may also like" cta="Full menu" ctaTo="/menu" />
        <div className="pgrid pgrid--coffee">
          {suggestions.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>
    </Page>
  )
}
