import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Page } from '../components/Reveal'
import { EmptyState } from '../components/SectionHead'
import { useMeta } from '../hooks'
import { verifyPayment } from '../lib/paymongo'
import { peso } from '../lib/format'

/**
 * PayMongo redirects here after payment. Verifies with PayMongo
 * (via the edge function) — never trusts the redirect alone.
 */
export default function CheckoutSuccess() {
  useMeta({ title: 'Payment status' })
  const [params] = useSearchParams()
  const ref = params.get('ref') || ''
  const [state, setState] = useState('checking') // checking | paid | pending | error
  const [total, setTotal] = useState(null)

  useEffect(() => {
    if (!ref) {
      setState('error')
      return
    }
    verifyPayment(ref).then((res) => {
      if (res.paid) {
        setTotal(res.total ?? null)
        setState('paid')
      } else {
        setState('pending')
      }
    }).catch(() => setState('error'))
  }, [ref])

  if (state === 'checking') {
    return (
      <Page><div className="route-loader" role="status" aria-label="Confirming payment">
        <span className="route-loader__mark">×</span>
      </div></Page>
    )
  }

  if (state === 'paid') {
    return (
      <Page>
        <div className="wrap section narrow">
          <div className="resv-confirm">
            <span className="resv-confirm__check"><Check size={22} strokeWidth={2.4} /></span>
            <p className="eyebrow">Payment received</p>
            <h2 className="resv-confirm__title">Paid{total != null && <> — {peso(total)}</>}<em>.</em></h2>
            <p className="resv-confirm__ref">Order {ref}</p>
            <p className="resv-confirm__note">We're on it — a receipt is on its way to your inbox.</p>
            <div className="resv-confirm__ctas">
              <Link to={`/orders/${ref}`} className="btn btn--solid btn--sm">Track your order</Link>
              <Link to="/menu" className="btn btn--line btn--sm">Back to shop</Link>
            </div>
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div className="wrap section">
        <EmptyState
          title={state === 'pending' ? "Payment isn't confirmed yet" : 'Something went wrong'}
          sub={state === 'pending'
            ? `We couldn't confirm payment for ${ref} yet — it can take a minute. Your order is saved either way.`
            : 'We could not verify this payment. Your order is saved — pay in store or try again.'}
          action={
            <div className="empty__ctas">
              {ref && <Link to={`/orders/${ref}`} className="btn btn--line btn--sm">View your order</Link>}
              <Link to="/" className="btn btn--solid btn--sm">Back home</Link>
            </div>
          }
        />
      </div>
    </Page>
  )
}
