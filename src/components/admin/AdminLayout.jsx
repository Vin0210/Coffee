import { NavLink, Link, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Coffee, Shirt, Package, Boxes, Users, CalendarDays,
  Sparkles, TrendingUp, ArrowLeft,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabaseConfigured } from '../../lib/supabase'
import { cx } from '../../lib/format'

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/coffee', label: 'Coffee', icon: Coffee },
  { to: '/admin/thrift', label: 'Thrift', icon: Shirt },
  { to: '/admin/orders', label: 'Orders', icon: Boxes },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reservations', label: 'Reservations', icon: CalendarDays },
  { to: '/admin/events', label: 'Events', icon: Sparkles },
  { to: '/admin/promotions', label: 'Promotions', icon: Sparkles },
  { to: '/admin/reports', label: 'Reports', icon: TrendingUp },
]

export default function AdminLayout() {
  const { user } = useAuth()
  return (
    <div className="admin">
      <aside className="admin__side">
        <Link to="/" className="admin__logo">Alegre × <em>GH</em></Link>
        <nav className="admin__nav" aria-label="Admin">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cx('admin__link', isActive && 'is-active')}>
              <n.icon size={15} strokeWidth={1.8} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin__side-foot">
          {!supabaseConfigured && <span className="admin__demo">Demo mode</span>}
          <p className="admin__user">{user?.full_name || 'Admin'}</p>
          <Link to="/" className="admin__back"><ArrowLeft size={13} strokeWidth={2} /> View site</Link>
        </div>
      </aside>
      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  )
}
