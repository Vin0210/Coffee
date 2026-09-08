import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Instagram } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { BRAND } from '../data/misc'

export default function Footer() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)

  const subscribe = async (e) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(value)) { toast('Enter a valid email address', 'error'); return }
    if (!supabaseConfigured) {
      toast('Newsletter connects with Supabase — signed up locally for now.')
      setEmail('')
      return
    }
    setBusy(true)
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email: value })
      if (error) {
        if (error.code === '23505') toast('You’re already on the list — good mail is coming.')
        else throw error
      } else {
        toast('You’re on the list — good mail is coming.')
        // Welcome email is best-effort; the subscription already succeeded.
        supabase.functions.invoke('send-email', {
          body: { type: 'newsletter-welcome', email: value },
        }).catch(() => {})
      }
      setEmail('')
    } catch {
      toast('Could not subscribe — try again in a bit.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <p className="footer__wordmark">Alegre ×<br /><em>Good Habits</em></p>
            <p className="footer__tag">Good coffee, good finds, good habits.</p>
          </div>

          <div className="footer__col">
            <p className="eyebrow">Explore</p>
            <Link to="/menu">Coffee</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/events">Events</Link>
            <Link to="/about">About</Link>
            <Link to="/reservations">Reservations</Link>
          </div>

          <div className="footer__col">
            <p className="eyebrow">Visit</p>
            <p>{BRAND.address}</p>
            {BRAND.hours.map((h) => (
              <p key={h.day} className="footer__hours"><span>{h.day}</span><br />{h.time}</p>
            ))}
          </div>

          <div className="footer__col footer__col--wide">
            <p className="eyebrow">Good Mail</p>
            <p className="footer__nl-copy">Drops, events, and finds. Once a week, no noise.</p>
            <form className="footer__nl" onSubmit={subscribe}>
              <input
                type="email" placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} aria-label="Email address"
              />
              <button type="submit" aria-label="Subscribe" disabled={busy}><ArrowRight size={16} strokeWidth={2} /></button>
            </form>
            <p className="eyebrow footer__soc-label">Follow</p>
            <div className="footer__soc">
              {BRAND.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                  {s.label === 'Instagram' && <Instagram size={13} strokeWidth={2} />} {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 Alegre × Good Habits. All rights reserved. <Link to="/admin" aria-label="Admin sign in">Admin</Link></p>
          <p className="footer__sig">Coffee. Clothes. <em>Good Habits.</em></p>
        </div>
      </div>
    </footer>
  )
}
