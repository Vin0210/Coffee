import { supabase, supabaseConfigured } from './supabase'
import { orderRef } from './format'

const LS_KEY = 'gh_orders'
const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
const writeLocal = (orders) => localStorage.setItem(LS_KEY, JSON.stringify(orders))

/**
 * Demo orders auto-advance through the status flow so the tracking page
 * feels alive without a backend. Production orders keep their DB status.
 */
export function effectiveStatus(order) {
  if (!order) return 'received'
  if (order.status && order.status !== 'auto') return order.status
  const mins = (Date.now() - new Date(order.created_at).getTime()) / 60000
  if (mins < 1) return 'received'
  if (mins < 3) return 'confirmed'
  if (mins < 6) return 'preparing'
  if (mins < 10) return 'ready'
  return 'completed'
}

/**
 * Creates an order. With Supabase connected + a signed-in user the order is
 * persisted to Postgres; otherwise it is stored locally (demo mode).
 * Payment is cash-on-pickup for now — the payload shape leaves room for
 * online payment metadata later.
 */
export async function createOrder(payload) {
  const ref = orderRef()
  if (supabaseConfigured && payload.userId) {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ref,
        user_id: payload.userId,
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        customer_email: payload.customer_email,
        order_type: payload.order_type,
        address: payload.address || null,
        pickup_time: payload.pickup_time || null,
        payment_method: payload.payment_method || 'cash_pickup',
        subtotal: payload.subtotal,
        fee: payload.fee,
        total: payload.total,
        note: payload.note || '',
        status: 'received',
      })
      .select('id, ref')
      .single()
    if (error) throw error
    await supabase.from('order_items').insert(
      payload.items.map((it) => ({
        order_id: data.id ?? undefined,
        name: it.name,
        unit_price: it.unit_price,
        qty: it.qty,
        options: it.options || {},
        line_total: it.line_total,
      }))
    )
    return { ref, persisted: true }
  }
  const order = {
    ref,
    status: 'auto',
    created_at: new Date().toISOString(),
    persisted: false,
    ...payload,
  }
  writeLocal([order, ...readLocal()])
  return { ref, persisted: false }
}

export async function getOrder(ref) {
  if (supabaseConfigured) {
    const { data } = await supabase.from('orders').select('*, order_items(*)').eq('ref', ref).maybeSingle()
    if (data) return { ...data, persisted: true }
  }
  return readLocal().find((o) => o.ref === ref) || null
}

export async function getMyOrders(userId) {
  if (supabaseConfigured && userId) {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) return data.map((o) => ({ ...o, persisted: true }))
  }
  const local = readLocal()
  if (local.length) return local
  return [] // callers fall back to sampleOrders for the demo experience
}
