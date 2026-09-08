import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SectionHead from '../../components/SectionHead'
import ProductCard from '../../components/ProductCard'
import { useCatalog } from '../../context/CatalogContext'

export default function CoffeeSection() {
  const trackRef = useRef(null)
  const { featuredCoffee, loading } = useCatalog()
  const items = featuredCoffee()

  const nudge = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <section className="home-coffee">
      <div className="wrap">
        <SectionHead
          no="02"
          eyebrow="Alegre Coffee"
          title="Made slowly.<br /><em>Served simply.</em>"
          sub="Seasonal single origins and a house blend built for milk. Every drink pulled to order, never to timer."
          cta="View full menu"
          ctaTo="/menu"
        />
      </div>

      <div className="hscroll">
        <div className="hscroll__track" ref={trackRef}>
          {loading ? (
            [0, 1, 2, 3].map((i) => (
              <div className="hscroll__cell" key={i}>
                <div className="sk sk--block" style={{ aspectRatio: '4/5' }} />
              </div>
            ))
          ) : (
            <>
              {items.map((p, i) => (
                <div className="hscroll__cell" key={p.id}>
                  <ProductCard product={p} index={i} priority={i < 3} />
                </div>
              ))}
            </>
          )}
          <div className="hscroll__cell hscroll__cell--end">
            <Link to="/menu" className="hscroll__more">
              <span>Full<br /><em>menu</em></span>
              <ChevronRight size={22} strokeWidth={1.6} />
            </Link>
          </div>
        </div>
        <div className="wrap hscroll__nav">
          <button type="button" aria-label="Scroll left" onClick={() => nudge(-1)}><ChevronLeft size={18} /></button>
          <button type="button" aria-label="Scroll right" onClick={() => nudge(1)}><ChevronRight size={18} /></button>
        </div>
      </div>
    </section>
  )
}
