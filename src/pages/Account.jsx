import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Heart, LogOut, Package, Sparkles, User as UserIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Page } from '../components/Reveal'
import ProductCard from '../components/ProductCard'
import { StatusPill } from '../components/OrderTimeline'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { useToast } from '../context/ToastContext'
import { useMeta } from '../hooks'
import { getMyOrders, effectiveStatus } from '../lib/orders'
import { useCatalog } from '../context/CatalogContext'
import { sampleOrders, rewardsTiers } from '../data/misc'
import { peso, fmtDateTime, cx } from '../lib/format'

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'rewards', label: 'Rewards', icon: Sparkles },
]

export default function Account() {
  useMeta({ title: 'My Account' })
  const { user, loading, isAdmin, signOut, updateProfile } = useAuth()
  const { thrift } = useCatalog()
  const { ids } = useFavorites()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')
  const [orders, setOrders] = useState(null)
  const [profile, setProfile] = useState({ full_name: '', phone: '' })

  useEffect(() => {
    if (!loading && !user) navigate('/auth', { state: { next: '/account' } })
  }, [user, loading, navigate])

  useEffect(() => {
    if (user) setProfile({ full_name: user.full_name || '', phone: user.phone || '' })
  }, [user])

  useEffect(() => {
    if (tab === 'orders' && user) {
      getMyOrders(user.demo ? null : user.id).then((o) => {
        setOrders(o.length ? o : sampleOrders)
      })
    }
  }, [tab, user])

  if (loading || !user) return <Page><div className="wrap section"><div className="sk sk--block" style={{ height: 300 }} /></div></Page>

  const points = user.points ?? 1240
  const nextTier = rewardsTiers.find((t) => t.points > points)
  const prevTierPoints = [...rewardsTiers].reverse().find((t) => t.points <= points)?.points ?? 0
  const progress = nextTier ? Math.min(100, Math.round(((points - prevTierPoints) / (nextTier.points - prevTierPoints)) * 100)) : 100
  const favs = thrift.filter((p) => ids.includes(p.id))

  const saveProfile = (e) => {
    e.preventDefault()
    updateProfile(profile)
    toast('Profile saved.')
  }

  return (
    <Page>
      <div className="wrap section">
        <div className="acct__head">
          <div>
            <p className="eyebrow">{user.demo ? 'Demo session' : 'Signed in'}</p>
            <h1 className="acct__name">{user.full_name || 'Friend'}<em>.</em></h1>
            <p className="acct__email">{user.email} · {points} pts</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {isAdmin && (
              <Link to="/admin" className="btn btn--solid btn--sm">
                Open dashboard <ArrowUpRight size={14} strokeWidth={2} />
              </Link>
            )}
            <button type="button" className="btn btn--line btn--sm" onClick={async () => { await signOut(); toast('Signed out. Come back soon.'); navigate('/') }}>
              <LogOut size={14} strokeWidth={2} /> Sign out
            </button>
          </div>
        </div>

        <div className="acct__tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={cx('acct__tab', tab === t.id && 'is-active')} onClick={() => setTab(t.id)}>
              <t.icon size={14} strokeWidth={2} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <form className="acct__panel" onSubmit={saveProfile}>
            <div className="cgroup__grid">
              <label className="field"><span>Full name</span>
                <input className="input" value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} />
              </label>
              <label className="field"><span>Phone</span>
                <input className="input" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
              </label>
              <label className="field field--wide"><span>Email</span>
                <input className="input" value={user.email} disabled />
              </label>
            </div>
            <button type="submit" className="btn btn--solid btn--sm">Save changes</button>
          </form>
        )}

        {tab === 'orders' && (
          <div className="acct__panel">
            {!orders ? <div className="sk sk--block" style={{ height: 160 }} /> : orders.length === 0 ? (
              <p className="acct__empty">No orders yet — your first cortado is waiting. <Link to="/menu">Order coffee</Link></p>
            ) : (
              <ul className="acct__orders">
                {orders.map((o) => (
                  <li key={o.ref}>
                    <Link to={`/orders/${o.ref}`} className="acct__order">
                      <div>
                        <p className="acct__order-ref">{o.ref}</p>
                        <p className="acct__order-meta">{fmtDateTime(o.created_at)} · {o.items?.length || 0} items · {o.order_type}</p>
                      </div>
                      <div className="acct__order-right">
                        <StatusPill status={effectiveStatus(o)} />
                        <span className="acct__order-total">{peso(o.total)}</span>
                        <ArrowUpRight size={15} strokeWidth={1.8} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'favorites' && (
          <div className="acct__panel">
            {favs.length === 0 ? (
              <p className="acct__empty">Nothing saved yet. Tap the heart on any piece to keep an eye on it. <Link to="/shop">Browse the racks</Link></p>
            ) : (
              <div className="pgrid pgrid--thrift">
                {favs.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        )}

        {tab === 'rewards' && (
          <div className="acct__panel">
            <div className="rewards__head">
              <div>
                <p className="eyebrow">Good Habits Rewards</p>
                <p className="rewards__points">{points.toLocaleString()} <span>points</span></p>
              </div>
              {nextTier && <p className="rewards__next">{nextTier.points - points} pts to {nextTier.title}</p>}
            </div>
            <div className="rewards__bar"><motion.div animate={{ width: `${progress}%` }} /></div>
            <ul className="rewards__tiers">
              {rewardsTiers.map((t) => (
                <li key={t.points} className={cx(points >= t.points && 'is-earned')}>
                  <span className="rewards__tier-pts">{t.points.toLocaleString()} pts</span>
                  <div>
                    <p className="rewards__tier-title">{t.title}</p>
                    <p className="rewards__tier-desc">{t.desc}</p>
                  </div>
                  <button
                    type="button" className="btn btn--line btn--sm" disabled={points < t.points}
                    onClick={() => toast(`Redeemed: ${t.title}. Show this screen at the counter.`)}
                  >
                    {points >= t.points ? 'Redeem' : 'Locked'}
                  </button>
                </li>
              ))}
            </ul>
            <p className="rewards__fine">Earn 1 pt per ₱1 on coffee, 2 pts per ₱1 on thrift, and bonus points at events.</p>
          </div>
        )}
      </div>
    </Page>
  )
}
