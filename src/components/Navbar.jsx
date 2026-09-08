import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu as MenuIcon, Search, ShoppingBag, User } from 'lucide-react'
import { useScrolled, useLockBody } from '../hooks'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { cx } from '../lib/format'
import SearchOverlay from './SearchOverlay'
import MobileMenu from './MobileMenu'
import { BRAND } from '../data/misc'

const LINKS = [
  { to: '/menu', label: 'Coffee' },
  { to: '/shop', label: 'Shop' },
  { to: '/events', label: 'Events' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const scrolled = useScrolled(24)
  const { count, setOpen } = useCart()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()

  useLockBody(menuOpen || searchOpen)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setMenuOpen(false); setSearchOpen(false) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <div className="nav__ticker" aria-hidden="true">
        <div className="nav__ticker-track">
          {[0, 1, 2].map((n) => (
            <span key={n}>
              DROP 04 — FRIDAY 7PM · FREE DRIP REFILL WITH ANY THRIFT PURCHASE OVER ₱500 · OPEN DAILY 8AM · {BRAND.address} ·&nbsp;
            </span>
          ))}
        </div>
      </div>

      <header className={cx('nav', scrolled && 'nav--scrolled')}>
        <div className="wrap nav__bar">
          <Link to="/" className="nav__logo" aria-label="Alegre × Good Habits — home">
            <span className="nav__logo-a">Alegre</span>
            <span className="nav__logo-x">×</span>
            <span className="nav__logo-b">Good Habits</span>
          </Link>

          <nav className="nav__links" aria-label="Primary">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => cx('nav__link', isActive && 'is-active')}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav__actions">
            <button type="button" className="nav__icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search size={17} strokeWidth={1.8} />
            </button>
            <Link to={user ? '/account' : '/auth'} className="nav__icon nav__icon--user" aria-label="Account">
              <User size={17} strokeWidth={1.8} />
            </Link>
            <button type="button" className="nav__icon nav__icon--cart" aria-label={`Cart, ${count} items`} onClick={() => setOpen(true)}>
              <ShoppingBag size={17} strokeWidth={1.8} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    className="nav__badge"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button type="button" className="nav__icon nav__icon--menu" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
              <MenuIcon size={19} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} user={user} />
      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay
            onClose={() => setSearchOpen(false)}
            onGo={(to) => { setSearchOpen(false); navigate(to) }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export { LINKS }
