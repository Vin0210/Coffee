import { supabase, supabaseConfigured } from './supabase'

/**
 * Sends the order confirmation + shop notification via the `send-email`
 * edge function (Resend). Fire-and-forget safe: never throws, so checkout
 * keeps working even if email is unconfigured or offline. No-op in demo mode.
 */
export async function sendOrderConfirmation(order) {
  if (!supabaseConfigured) return { skipped: 'demo-mode' }
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: { type: 'order-confirmation', order },
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err?.message || 'email failed' }
  }
}
