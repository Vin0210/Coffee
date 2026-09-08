import { supabase, supabaseConfigured } from './supabase'

/**
 * PayMongo Links checkout — GCash, GrabPay, and cards on PayMongo's
 * hosted page. Throws on error so checkout can show it honestly.
 * Requires Supabase connected + the `paymongo` edge function deployed.
 */
export async function createPaymentLink(order) {
  if (!supabaseConfigured) throw new Error('Online payment needs Supabase connected.')
  const { data, error } = await supabase.functions.invoke('paymongo', {
    body: { action: 'create', order },
  })
  if (error) throw new Error(error.message || 'Payment link failed.')
  if (data?.ok === false) throw new Error(data?.error || 'Payment link failed.')
  if (!data?.checkout_url) throw new Error('No checkout URL returned.')
  return data.checkout_url
}

export async function verifyPayment(ref) {
  if (!supabaseConfigured) return { paid: false }
  const { data, error } = await supabase.functions.invoke('paymongo', {
    body: { action: 'verify', ref },
  })
  if (error || data?.ok === false) return { paid: false, error: error?.message || data?.error }
  return { paid: Boolean(data?.paid), total: data?.total }
}
