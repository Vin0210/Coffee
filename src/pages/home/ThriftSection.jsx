import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SectionHead from '../../components/SectionHead'
import ProductCard from '../../components/ProductCard'
import Reveal from '../../components/Reveal'
import { useCatalog } from '../../context/CatalogContext'

/** Editorial fashion grid — deliberately uneven spans */
export default function ThriftSection() {
  const { featuredThrift, loading } = useCatalog()
  const items = featuredThrift().slice(0, 8)

  return (
    <section className="home-thrift">
      <div className="wrap">
        <SectionHead
          no="03"
          eyebrow="Good Habits"
          title="Secondhand pieces with<br /><em>another life ahead.</em>"
          sub="Hand-picked vintage and workwear. One of each — once it's yours, it's nobody else's."
          cta="Shop all pieces"
          ctaTo="/shop"
        />

        <div className="tgrid">
          {loading ? (
            [0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="tgrid__cell">
                <div className="sk sk--block" style={{ aspectRatio: '3/4' }} />
              </div>
            ))
          ) : (
            items.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i * 0.05, 0.25)} className={`tgrid__cell tgrid__cell--${i % 8}`}>
                <ProductCard product={p} index={i} priority={i < 4} />
              </Reveal>
            ))
          )}
        </div>

        <Reveal className="home-thrift__cta">
          <Link to="/shop" className="btn btn--solid">
            Shop All Pieces <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
