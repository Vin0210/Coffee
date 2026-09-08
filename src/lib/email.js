import { supabase, supabaseConfigured } from './supabase'

/**
 * Transactional mail via the `send-email` edge function (Resend).
 * All helpers are fire-and-forget safe: they never throw, so checkout,
 * booking, and admin flows keep working even if email is unconfigured
 * or offline. No-op in demo mode.
 */
async function invoke(body) {
  if (!supabaseConfigured) return { skipped: 'demo-mode' }
  try {
    const { error } = await supabase.functions.invoke('send-email', { body })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err?.message || 'email failed' }
  }
}

export const sendOrderConfirmation = (order) =>
  invoke({ type: 'order-confirmation', order })

export const sendOrderStatus = (order) => {
  if (!order?.customer_email) return Promise.resolve({ skipped: 'no-email' })
  if (order.status !== 'ready' && order.status !== 'completed') {
    return Promise.resolve({ skipped: 'status-not-emailed' })
  }
  return invoke({ type: 'order-status', order })
}

export const sendReservationReceived = (reservation) => {
  if (!reservation?.email) return Promise.resolve({ skipped: 'no-email' })
  return invoke({ type: 'reservation-received', reservation })
}

export const sendReservationStatus = (reservation) => {
  if (!reservation?.email) return Promise.resolve({ skipped: 'no-email' })
  if (reservation.status !== 'confirmed' && reservation.status !== 'cancelled') {
    return Promise.resolve({ skipped: 'status-not-emailed' })
  }
  return invoke({ type: 'reservation-status', reservation })
}
