import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Clock, MapPin, Users } from 'lucide-react'
import { Page } from '../components/Reveal'
import { PageHead } from '../components/SectionHead'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useMeta } from '../hooks'
import { reservationSlots, BRAND } from '../data/misc'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { cx } from '../lib/format'

const EMAIL_RE = /^\S+@\S+\.\S+$/

export default function Reservations() {
  useMeta({ title: 'Reservations', description: 'Reserve a table at Alegre × Good Habits — coffee, clothes and company.' })
  const { user } = useAuth()
  const { toast } = useToast()

  const [form, setForm] = useState({
    name: user?.full_name || '', phone: user?.phone || '', email: user?.email || '',
    date: '', time: reservationSlots[2], guests: 2, request: '',
  })
  const [booking, setBooking] = useState(false)
  const [done, setDone] = useState(null)

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const today = new Date().toISOString().slice(0, 10)
  const valid = form.name.trim().length > 1 && form.phone.trim().length >= 7 && EMAIL_RE.test(form.email.trim()) && form.date

  const submit = async (e) => {
    e.preventDefault()
    if (!valid || booking) return
    setBooking(true)
    const ref = 'RSV-' + Math.random().toString(36).slice(2, 6).toUpperCase()
    const payload = {
      user_id: user && !user.demo ? user.id : null,
      name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(),
      date: form.date, time: form.time, guests: form.guests,
      request: form.request.trim(), status: 'pending',
    }
    try {
      if (supabaseConfigured) {
        const { error } = await supabase.from('reservations').insert(payload)
        if (error) throw error
        // Confirmation email, best-effort — the booking already succeeded.
        supabase.functions.invoke('send-email', {
          body: { type: 'reservation-received', reservation: { ...payload, ref } },
        }).catch(() => {})
      }
      setDone({ ...form, ref })
      toast('Table requested — confirmation by email and SMS.')
    } catch {
      toast('Could not save the reservation — try again.', 'error')
    } finally {
      setBooking(false)
    }
  }

  if (done) {
    return (
      <Page>
        <div className="wrap section narrow">
          <motion.div className="resv-confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="resv-confirm__check"><Check size={22} strokeWidth={2.4} /></span>
            <p className="eyebrow">Reservation received</p>
            <h2 className="resv-confirm__title">See you soon, {done.name.split(' ')[0]}<em>.</em></h2>
            <div className="resv-confirm__detail">
              <p><strong>{done.guests}</strong> guest{done.guests > 1 ? 's' : ''}</p>
              <p><strong>{new Date(done.date + 'T12:00:00').toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}</strong></p>
              <p><strong>{done.time}</strong></p>
              <p className="resv-confirm__ref">Ref {done.ref}</p>
            </div>
            {done.request && <p className="resv-confirm__req">“{done.request}”</p>}
            <p className="resv-confirm__note">Tables are held for 15 minutes past the reserved time. We'll email your confirmation shortly.</p>
            <div className="resv-confirm__ctas">
              <button type="button" className="btn btn--line btn--sm" onClick={() => setDone(null)}>Book another</button>
              <a className="btn btn--solid btn--sm" href={BRAND.socials[0].href} target="_blank" rel="noreferrer">Follow for drop news</a>
            </div>
          </motion.div>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <PageHead
        eyebrow="Reservations"
        title="Save a <em>table</em>"
        sub="Walk-ins always welcome, but a reservation guarantees the window seat."
      />

      <div className="wrap section">
        <div className="resv">
          <form className="resv__form" onSubmit={submit}>
            <div className="cgroup__grid">
              <label className="field"><span>Name *</span>
                <input className="input" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Juan dela Cruz" required />
              </label>
              <label className="field"><span>Phone *</span>
                <input className="input" value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+63 917 000 0000" required />
              </label>
              <label className="field field--wide"><span>Email * <span className="opt__hint">for booking confirmation</span></span>
                <input className="input" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@email.com" required />
              </label>
              <label className="field"><span>Date *</span>
                <input className="input" type="date" min={today} value={form.date} onChange={(e) => set({ date: e.target.value })} required />
              </label>
              <label className="field"><span>Time</span>
                <select className="input" value={form.time} onChange={(e) => set({ time: e.target.value })}>
                  {reservationSlots.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="field field--wide"><span>Guests</span>
                <div className="guests">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <button key={n} type="button" className={cx('chip', form.guests === n && 'is-active')} onClick={() => set({ guests: n })}>{n}</button>
                  ))}
                  <span className="guests__hint"><Users size={13} strokeWidth={2} /> 8+ — email us for events</span>
                </div>
              </label>
              <label className="field field--wide"><span>Special request</span>
                <input className="input" value={form.request} onChange={(e) => set({ request: e.target.value })} placeholder="Birthday, laptop morning, window seat…" />
              </label>
            </div>
            <button type="submit" className="btn btn--solid" disabled={!valid || booking}>
              {booking ? 'Sending…' : 'Request reservation'}
            </button>
          </form>

          <aside className="resv__info">
            <div>
              <p className="eyebrow"><MapPin size={12} strokeWidth={2} /> Location</p>
              <p>{BRAND.address}</p>
            </div>
            <div>
              <p className="eyebrow"><Clock size={12} strokeWidth={2} /> Hours</p>
              {BRAND.hours.map((h) => <p key={h.day} className="resv__hours"><span>{h.day}</span> {h.time}</p>)}
            </div>
            <div>
              <p className="eyebrow">Good to know</p>
              <p>Reservations are for the seating area — the coffee bar and racks stay first-come, first-served.</p>
            </div>
          </aside>
        </div>
      </div>
    </Page>
  )
}
