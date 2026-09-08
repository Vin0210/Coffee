import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, User, X } from 'lucide-react'
import { ease } from './Reveal'
import { BRAND } from '../data/misc'
import { cx } from '../lib/format'
import { LINKS } from './Navbar'

export default function MobileMenu({ open, onClose, user }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="mmenu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mmenu__top">
            <span className="mmenu__brand">Alegre × <em>Good Habits</em></span>
            <button type="button" className="nav__icon" aria-label="Close menu" onClick={onClose}>
              <X size={20} strokeWidth={1.8} />
            </button>
          </div>

          <nav className="mmenu__nav" aria-label="Mobile">
            {LINKS.map((l, i) => (
              <motion.div
                key={l.to}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06, duration: 0.5, ease }}
              >
                <NavLink
                  to={l.to}
                  className={({ isActive }) => cx('mmenu__link', isActive && 'is-active')}
                  onClick={onClose}
                >
                  <span className="mmenu__no">0{i + 1}</span>
                  {l.label}
                  <ArrowUpRight size={22} strokeWidth={1.6} className="mmenu__arrow" />
                </NavLink>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + LINKS.length * 0.06, duration: 0.5, ease }}
            >
              <NavLink to={user ? '/account' : '/auth'} className="mmenu__link mmenu__link--account" onClick={onClose}>
                <span className="mmenu__no">0{LINKS.length + 1}</span>
                {user ? 'Account' : 'Sign in'}
                <User size={20} strokeWidth={1.6} className="mmenu__arrow" />
              </NavLink>
            </motion.div>
          </nav>

          <motion.div
            className="mmenu__foot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="mmenu__foot-grid">
              <div>
                <p className="eyebrow">Visit</p>
                <p>{BRAND.address}</p>
              </div>
              <div>
                <p className="eyebrow">Hours</p>
                <p>Daily · 8AM – late</p>
              </div>
              <div>
                <p className="eyebrow">Follow</p>
                <p><a href={BRAND.socials[0].href} target="_blank" rel="noreferrer">{BRAND.socials[0].handle}</a></p>
              </div>
            </div>
            <p className="mmenu__tag">Coffee. Clothes. <em>Good Habits.</em></p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
