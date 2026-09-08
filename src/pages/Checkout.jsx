import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Wallet } from 'lucide-react'
import { Page } from '../components/Reveal'
import { PageHead, EmptyState } from '../components/SectionHead'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useMeta } from '../hooks'
import { createOrder } from '../lib/orders'
import { sendOrderConfirmation } from '../lib/email'
import { pickupTimes, deliveryFee } from '../data/misc'
import { peso, cx } from '../lib/format'
import { phDataUri } from '../lib/placeholder'
import { resolveImage, imageForItem } from '../lib/images'
import { useCatalog } from '../context/CatalogContext'

export default function Checkout() {
  useMeta({ title: 'Checkout' })
  const { items, subtotal, clear } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user?.full_name || '', phone: user?.phone || '', email: user?.email || '',
    type: 'pickup', pickupTime: pickupTimes[0], address: '', note: '',
  })
  const [placing, setPlacing] = useState(false)
  const fee = form.type === 'delivery' ? deliveryFee : 0
  const { allProducts } = useCatalog()
  const byId = (id) => allProducts().find((p) => p.id === id || p.slug === id)
  const thumbSrc = (i) =>
    imageForItem(i, byId) || resolveImage(i.src) ||
    phDataUri({ label: i.ph?.label || i.name, tone: i.ph?.tone || 'sand', kind: i.ph?.kind || 'arch' })

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const valid =
    form.name.trim().length > 1 &&
    /^[\d+\-\s()]{7,}$/.test(form.phone.trim()) &&
    /^\S+@\S+\.\S+$/.test(form.email.trim()) &&
    (form.type === 'pickup' || form.address.trim().length > 5)

  const place = async (e) => {
    e.preventDefault()
    if (!valid || placing) return
    setPlacing(true)
    try {
      const payload = {
        userId: user && !user.demo ? user.id : null,
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_email: form.email.trim(),
        order_type: form.type,
        address: form.type === 'delivery' ? form.address.trim() : null,
        pickup_time: form.pickupTime,
        payment_method: 'cash_pickup',
        subtotal, fee, total: subtotal + fee, note: form.note.trim(),
        items: items.map((i) => ({ name: i.name, unit_price: i.price, qty: i.qty, options: i.options, line_total: i.price * i.qty })),
      }
      const { ref } = await createOrder(payload)
      // Receipt email (customer) + new-order ping (shop). Never blocks checkout.
      sendOrderConfirmation({ ref, ...payload })
      clear()
      toast('Order placed — we got you.')
      navigate(`/orders/${ref}`, { state: { fresh: true } })
    } catch {
      toast('Could not place the order — try again.', 'error')
      setPlacing(false)
    }
  }

  if (items.length === 0 && !placing) {
    return (
      <Page><div className="wrap section">
        <EmptyState title="Nothing to check out" sub="Your cart is empty." action={<Link to="/menu" className="btn btn--solid btn--sm">Browse the menu</Link>} />
      </div></Page>
    )
  }

  return (
    <Page>
      <PageHead eyebrow="Almost there" title="Checkout" />

      <div className="wrap section">
        <form className="checkout" onSubmit={place}>
          <div className="checkout__form">
            <fieldset className="cgroup">
              <legend className="cgroup__title">01 — Customer</legend>
              <div className="cgroup__grid">
                <label className="field"><span>Full name *</span>
                  <input className="input" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Juan dela Cruz" required />
                </label>
                <label className="field"><span>Phone *</span>
                  <input className="input" value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+63 917 000 0000" required />
                </label>
                <label className="field field--wide"><span>Email *</span>
                  <input className="input" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@email.com" required />
                </label>
              </div>
            </fieldset>

            <fieldset className="cgroup">
              <legend className="cgroup__title">02 — Order type</legend>
              <div className="otype">
                {[['pickup', 'Pickup', 'Free · ready in 15–20 min'], ['delivery', 'Delivery', `Zamboanga City · ${peso(deliveryFee)}`]].map(([v, label, hint]) => (
                  <button
                    key={v} type="button"
                    className={cx('otype__opt', form.type === v && 'is-active')}
                    onClick={() => set({ type: v })}
                    aria-pressed={form.type === v}
                  >
                    <span className="otype__radio" aria-hidden="true" />
                    <span className="otype__label">{label}</span>
                    <span className="otype__hint">{hint}</span>
                  </button>
                ))}
              </div>

              {form.type === 'pickup' ? (
                <div className="cgroup__grid cgroup__grid--mt">
                  <label className="field"><span>Pickup location</span>
                    <input className="input" value="Alegre × Good Habits — Tumaga - Putik Rd, Zamboanga City" readOnly />
                  </label>
                  <label className="field"><span>Preferred pickup time</span>
                    <select className="input" value={form.pickupTime} onChange={(e) => set({ pickupTime: e.target.value })}>
                      {pickupTimes.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </label>
                </div>
              ) : (
                <label className="field cgroup__grid--mt"><span>Delivery address *</span>
                  <input className="input" value={form.address} onChange={(e) => set({ address: e.target.value })} placeholder="Unit, building, street, city" required />
                </label>
              )}
            </fieldset>

            <fieldset className="cgroup">
              <legend className="cgroup__title">03 — Payment</legend>
              <div className="payopt is-active">
                <span className="payopt__icon"><Wallet size={16} strokeWidth={1.8} /></span>
                <div>
                  <p className="payopt__name">Cash on pickup{form.type === 'delivery' ? ' / delivery' : ''}</p>
                  <p className="payopt__hint">Pay when you receive your order. GCash & cards coming soon.</p>
                </div>
                <span className="payopt__check"><Check size={14} strokeWidth={2.4} /></span>
              </div>
              <label className="field cgroup__grid--mt"><span>Notes for the bar (optional)</span>
                <input className="input" value={form.note} onChange={(e) => set({ note: e.target.value })} placeholder="Oat milk on the side, extra napkins, it's a gift…" />
              </label>
            </fieldset>
          </div>

          <aside className="checkout__summary">
            <h3 className="cartpage__head">Order summary</h3>
            <ul className="checkout__items">
              {items.map((i) => (
                <li key={i.lineId}>
                  <img src={thumbSrc(i)} alt={i.name} loading="lazy" decoding="async" />
                  <div>
                    <p>{i.name} <span>× {i.qty}</span></p>
                    <p className="checkout__item-opts">{[i.options?.size, i.options?.milk].filter(Boolean).join(' · ') || (i.type === 'thrift' ? 'One of one' : '')}</p>
                  </div>
                  <span>{peso(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="cartpage__row"><span>Subtotal</span><strong>{peso(subtotal)}</strong></div>
            <div className="cartpage__row"><span>{form.type === 'delivery' ? 'Delivery' : 'Pickup'}</span><strong>{fee ? peso(fee) : 'Free'}</strong></div>
            <div className="cartpage__row cartpage__row--total"><span>Total</span><strong>{peso(subtotal + fee)}</strong></div>
            <button type="submit" className="btn btn--solid btn--full" disabled={!valid || placing}>
              {placing ? 'Placing order…' : `Place order — ${peso(subtotal + fee)}`}
            </button>
            <p className="checkout__fine">You'll receive SMS updates as your order moves.</p>
          </aside>
        </form>
      </div>
    </Page>
  )
}
