import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useToast } from './ToastContext'
import { peso } from '../lib/format'

const CartContext = createContext(null)
export const useCart = () => useContext(CartContext)

const LS_KEY = 'gh_cart'

/**
 * One cart for coffee + thrift.
 * Coffee lines:  { productId, type:'coffee', qty, options:{size,milk,sugar,addons[]} }
 * Thrift lines:  { productId, type:'thrift', qty:1 (one-of-one, never doubled) }
 */
export function CartProvider({ children }) {
  const { toast } = useToast()
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
  })
  const [isOpen, setOpen] = useState(false)

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(items)) }, [items])
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  function add({ product, qty = 1, options = {}, silent = false }) {
    if (product.type === 'thrift' && product.status === 'sold') {
      toast('This piece is already sold — sorry!', 'error')
      return
    }
    const pid = product.id ?? product.slug
    setItems((prev) => {
      if (product.type === 'thrift') {
        if (prev.some((i) => i.productId === pid)) {
          toast('Already in your cart — each piece is one of one.')
          return prev
        }
        return [...prev, {
          lineId: `${pid}`,
          productId: pid, type: 'thrift', name: product.name,
          price: product.price, qty: 1, options,
          src: product.src, ph: product.ph, slug: product.slug, maxQty: 1,
        }]
      }
      const key = JSON.stringify(options)
      const existing = prev.find((i) => i.productId === pid && i.key === key)
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, qty: Math.min(i.qty + qty, 20) } : i))
      }
      return [...prev, {
        lineId: `${pid}#${key}`,
        productId: pid, type: 'coffee', name: product.name,
        price: product.price, qty, options, key,
        src: product.src, ph: product.ph, slug: product.slug, maxQty: 20,
      }]
    })
    if (!silent) toast(`${product.name} added to cart — ${peso(product.type === 'coffee' ? product.price : product.price)}`)
    setOpen(true)
  }

  function setQty(lineId, qty) {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.lineId !== lineId) : prev.map((i) => (i.lineId === lineId ? { ...i, qty } : i))
    )
  }
  function remove(lineId) { setItems((prev) => prev.filter((i) => i.lineId !== lineId)) }
  function clear() { setItems([]) }

  const { count, subtotal } = useMemo(() => ({
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.price * i.qty, 0),
  }), [items])

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, count, subtotal, isOpen, setOpen }}>
      {children}
    </CartContext.Provider>
  )
}
