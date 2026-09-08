import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { CartProvider } from './context/CartContext'
import { CatalogProvider } from './context/CatalogContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

const Menu = lazy(() => import('./pages/Menu'))
const MenuProduct = lazy(() => import('./pages/MenuProduct'))
const Shop = lazy(() => import('./pages/Shop'))
const ShopProduct = lazy(() => import('./pages/ShopProduct'))
const Events = lazy(() => import('./pages/Events'))
const About = lazy(() => import('./pages/About'))
const Reservations = lazy(() => import('./pages/Reservations'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderStatus = lazy(() => import('./pages/OrderStatus'))
const Auth = lazy(() => import('./pages/Auth'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const Account = lazy(() => import('./pages/Account'))

const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminHome = lazy(() => import('./pages/admin/AdminHome'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'))
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'))
const AdminReservations = lazy(() => import('./pages/admin/AdminReservations'))
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'))
const AdminPromotions = lazy(() => import('./pages/admin/AdminPromotions'))
const AdminReports = lazy(() => import('./pages/admin/AdminReports'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const Loader = () => (
  <div className="route-loader" role="status" aria-label="Loading">
    <span className="route-loader__mark">×</span>
  </div>
)

function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <Suspense fallback={<Loader />}>{children}</Suspense>
      <Footer />
      <CartDrawer />
    </>
  )
}

/** Protects /admin — signed-in admins only. Demo sessions never qualify. */
function RequireAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/auth" state={{ next: '/admin' }} replace />
  if (!isAdmin) return <Navigate to="/account" replace />
  return children
}

function AnimatedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SiteLayout><Home /></SiteLayout>} />
      <Route path="/menu" element={<SiteLayout><Menu /></SiteLayout>} />
      <Route path="/menu/:slug" element={<SiteLayout><MenuProduct /></SiteLayout>} />
      <Route path="/shop" element={<SiteLayout><Shop /></SiteLayout>} />
      <Route path="/shop/:slug" element={<SiteLayout><ShopProduct /></SiteLayout>} />
      <Route path="/events" element={<SiteLayout><Events /></SiteLayout>} />
      <Route path="/about" element={<SiteLayout><About /></SiteLayout>} />
      <Route path="/reservations" element={<SiteLayout><Reservations /></SiteLayout>} />
      <Route path="/cart" element={<SiteLayout><Cart /></SiteLayout>} />
      <Route path="/checkout" element={<SiteLayout><Checkout /></SiteLayout>} />
      <Route path="/orders/:ref" element={<SiteLayout><OrderStatus /></SiteLayout>} />
      <Route path="/auth" element={<SiteLayout><Auth /></SiteLayout>} />
      <Route path="/auth/reset" element={<SiteLayout><Auth initialMode="reset" /></SiteLayout>} />
      <Route path="/auth/callback" element={<SiteLayout><AuthCallback /></SiteLayout>} />
      <Route path="/account" element={<SiteLayout><Account /></SiteLayout>} />

      <Route path="/admin" element={<RequireAdmin><Suspense fallback={<Loader />}><AdminLayout /></Suspense></RequireAdmin>}>
        <Route index element={<AdminHome />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="coffee" element={<AdminProducts presetType="coffee" />} />
        <Route path="thrift" element={<AdminProducts presetType="thrift" />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="reservations" element={<AdminReservations />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      <Route path="*" element={<SiteLayout><NotFound /></SiteLayout>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CatalogProvider>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <ScrollToTop />
              <AnimatedRoutes />
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
      </CatalogProvider>
    </BrowserRouter>
  )
}
