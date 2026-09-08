// ============================================================
// ALEGRE × GOOD HABITS — PayMongo Links checkout (Deno edge function)
// Actions (POST JSON):
//   { action: 'create', order: { ref, total, email, name } }
//     → creates a PayMongo payment link, returns { checkout_url }
//   { action: 'verify', ref }
//     → re-checks the link with PayMongo, marks paid if so
// Webhook (PayMongo dashboard → this function URL):
//   link.payment.paid → confirms with PayMongo API, then marks paid
//
// Trust model: we never trust the event body alone — every paid claim is
// re-fetched from api.paymongo.com with the secret key before writing.
// Deploy:  supabase functions deploy paymongo
// Secrets: supabase secrets set PAYMONGO_SECRET_KEY=sk_test_... SITE_URL=https://...
//   (test keys start sk_test_ — flip to sk_live_ when going real)
// JWT verification stays ON — the web app calls with its anon key.
// ============================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

const siteUrl = () => (Deno.env.get('SITE_URL') || 'https://alegrexgoodhabits.pages.dev').replace(/\/$/, '')
const paymongoAuth = () => `Basic ${btoa((Deno.env.get('PAYMONGO_SECRET_KEY') || '') + ':')}`

function admin() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('Missing service-role env')
  return createClient(url, key)
}

async function markPaid(ref: string, linkId: string) {
  const db = admin()
  const { error } = await db
    .from('orders')
    .update({ payment_status: 'paid', paid_at: new Date().toISOString(), payment_link_id: linkId })
    .eq('ref', ref)
    .neq('payment_status', 'paid')
  if (error) throw error
}

async function getLink(linkId: string) {
  const res = await fetch(`https://api.paymongo.com/v1/links/${linkId}`, {
    headers: { Authorization: paymongoAuth() },
  })
  if (!res.ok) throw new Error(`PayMongo ${res.status}: ${await res.text()}`)
  return res.json()
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const body = await req.json()

    // ---- PayMongo webhook: link.payment.paid ----
    if (body?.data?.attributes?.type === 'link.payment.paid') {
      const evt = body.data.attributes.data?.attributes || {}
      const ref: string = body.data.attributes.data?.metadata?.order_ref || evt.reference_number || ''
      const linkId: string = evt.link_id || evt.link || ''
      if (ref && linkId) {
        const link = await getLink(linkId)
        if (link?.data?.attributes?.status === 'paid') await markPaid(ref, linkId)
      } else if (ref) {
        // Fallback: find the order's link and confirm directly.
        const db = admin()
        const { data: order } = await db.from('orders').select('ref,payment_link_id').eq('ref', ref).maybeSingle()
        if (order?.payment_link_id) {
          const link = await getLink(order.payment_link_id)
          if (link?.data?.attributes?.status === 'paid') await markPaid(ref, order.payment_link_id)
        }
      }
      return new Response(JSON.stringify({ ok: true }), { headers: cors })
    }

    if (!Deno.env.get('PAYMONGO_SECRET_KEY')) throw new Error('Missing PAYMONGO_SECRET_KEY secret')
    const { action } = body

    // ---- create a payment link ----
    if (action === 'create') {
      const order = body.order || {}
      const total = Math.round(Number(order.total) || 0)
      if (!order.ref || total < 20) throw new Error('Order ref and a total of at least ₱20 are required')
      const amount = Math.round(total * 100) // centavos
      const res = await fetch('https://api.paymongo.com/v1/links', {
        method: 'POST',
        headers: { Authorization: paymongoAuth(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            attributes: {
              amount,
              description: `Alegre x Good Habits — Order ${order.ref}`,
              remarks: `Coffee + thrift · ${order.name || 'Guest'}`,
              metadata: { order_ref: order.ref },
              redirect: {
                success: `${siteUrl()}/checkout/success?ref=${encodeURIComponent(order.ref)}`,
                failure: `${siteUrl()}/checkout?payment=cancelled`,
              },
            },
          },
        }),
      })
      if (!res.ok) throw new Error(`PayMongo ${res.status}: ${await res.text()}`)
      const link = await res.json()
      const db = admin()
      const { error } = await db
        .from('orders')
        .update({
          payment_method: 'paymongo',
          payment_status: 'unpaid',
          payment_link_id: link.data.id,
          payment_link_url: link.data.attributes.checkout_url,
        })
        .eq('ref', order.ref)
      if (error) throw error
      return new Response(JSON.stringify({ checkout_url: link.data.attributes.checkout_url }), { headers: cors })
    }

    // ---- verify (success page calls this) ----
    if (action === 'verify') {
      const ref = String(body.ref || '')
      if (!ref) throw new Error('ref is required')
      const db = admin()
      const { data: order, error } = await db
        .from('orders')
        .select('ref,total,payment_status,payment_link_id')
        .eq('ref', ref)
        .maybeSingle()
      if (error) throw error
      if (!order) throw new Error('Order not found')
      if (order.payment_status === 'paid') {
        return new Response(JSON.stringify({ paid: true, total: order.total }), { headers: cors })
      }
      if (order.payment_link_id) {
        const link = await getLink(order.payment_link_id)
        if (link?.data?.attributes?.status === 'paid') {
          await markPaid(ref, order.payment_link_id)
          return new Response(JSON.stringify({ paid: true, total: order.total }), { headers: cors })
        }
      }
      return new Response(JSON.stringify({ paid: false, total: order.total }), { headers: cors })
    }

    throw new Error('Unknown action')
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String((err as Error)?.message || err) }), {
      status: 400,
      headers: cors,
    })
  }
})
