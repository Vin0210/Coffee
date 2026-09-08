import { Link } from 'react-router-dom'
import { ArrowUpRight, Heart } from 'lucide-react'
import SmartImage from './SmartImage'
import { peso, cx } from '../lib/format'
import { useFavorites } from '../context/FavoritesContext'
import { useCart } from '../context/CartContext'
import { useMemo } from 'react'

/** Product card used across menu, shop, home + related grids */
export default function ProductCard({ product, index = 0, priority = false }) {
  const { add } = useCart()
  const { has, toggle } = useFavorites()
  const isThrift = product.type === 'thrift'
  const sold = isThrift && product.status === 'sold'
  const to = isThrift ? `/shop/${product.slug}` : `/menu/${product.slug}`

  // gallery placeholder variety for thrift cards
  const kind = useMemo(() => {
    if (!isThrift) return product.ph.kind
    const cycle = ['tee', 'arch', 'stripe', 'stitch']
    return cycle[index % cycle.length]
  }, [isThrift, index, product.ph.kind])

  return (
    <article className={cx('pcard', isThrift && 'pcard--thrift', sold && 'pcard--sold')}>
      <Link to={to} className="pcard__media" aria-label={product.name}>
        <SmartImage
          src={product.src}
          label={product.ph.label}
          tone={product.ph.tone}
          kind={kind}
          ratio={isThrift ? '3/4' : '4/5'}
          priority={priority}
        />
        {sold && <span className="pcard__sold">Sold</span>}
        {isThrift && !sold && product.condition >= 9 && (
          <span className="pcard__flag">Grade 9/10</span>
        )}
      </Link>

      {isThrift && (
        <button
          type="button"
          className={cx('pcard__heart', has(product.id) && 'is-on')}
          aria-label={has(product.id) ? 'Remove from favorites' : 'Save to favorites'}
          onClick={() => toggle(product)}
        >
          <Heart size={15} strokeWidth={2} fill={has(product.id) ? 'currentColor' : 'none'} />
        </button>
      )}

      <div className="pcard__body">
        <div className="pcard__row">
          {isThrift ? (
            <p className="pcard__brand">{product.brand}</p>
          ) : (
            <p className="pcard__brand">{product.short}</p>
          )}
          <span className="pcard__price">{peso(product.price)}</span>
        </div>
        <Link to={to} className="pcard__name">{product.name}</Link>
        {isThrift ? (
          <div className="pcard__meta">
            <span>Size {product.size}</span>
            <span className="pcard__dot">·</span>
            <span>{product.condition}/10</span>
            <span className="pcard__dot">·</span>
            <span className={sold ? 'is-sold' : 'is-open'}>{sold ? 'Sold' : 'Available'}</span>
          </div>
        ) : (
          <button
            type="button"
            className="pcard__add"
            onClick={() => add({ product, options: { size: product.sizes?.[0]?.label || null, milk: null, sugar: '50%', addons: [] } })}
          >
            Add to cart <ArrowUpRight size={13} strokeWidth={2.2} />
          </button>
        )}
      </div>
    </article>
  )
}
