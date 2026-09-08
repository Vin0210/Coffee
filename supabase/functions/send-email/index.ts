// ============================================================
// ALEGRE × GOOD HABITS — send-email edge function (Deno)
// Sends transactional mail via Resend: order receipts to customers
// plus a new-order notification to the shop.
// Deploy:  supabase functions deploy send-email
// Secrets: supabase secrets set RESEND_API_KEY=... EMAIL_FROM=... SHOP_EMAIL=...
//   RESEND_API_KEY  resend.com → API Keys
//   EMAIL_FROM      verified sender, e.g. "Alegre × Good Habits <hello@alegrexgoodhabits.com>"
//   SHOP_EMAIL      where new-order notifications go, e.g. orders@alegrexgoodhabits.com
// JWT verification stays ON (default) — the web app calls this with its
// Supabase anon key via supabase.functions.invoke().
// ============================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const peso = (n: number) => `₱${Number(n || 0).toLocaleString('en-PH')}`

function receiptHtml(order: any): string {
  const items = (order.items || [])
    .map(
      (i: any) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${esc(i.name)} <span style="color:#888;">× ${esc(i.qty)}</span></td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #eee;">${peso(i.line_total)}</td>
      </tr>`
    )
    .join('')
  const fulfillment =
    order.order_type === 'delivery'
      ? `<p style="margin:12px 0 0;">Delivering to: ${esc(order.address)}</p>`
      : `<p style="margin:12px 0 0;">Pickup: ${esc(order.pickup_time || 'ASAP (15–20 min)')}<br/>Alegre × Good Habits — Tumaga - Putik Rd, Zamboanga City</p>`
  return `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#211A17;">
    <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#68705A;">Alegre × Good Habits</p>
    <h1 style="font-weight:400;">Thanks, ${esc(order.customer_name?.split(' ')[0] || 'friend')}<em>.</em></h1>
    <p>We got your order <strong>${esc(order.ref)}</strong> — show this reference at the counter.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">${items}</table>
    <p>Subtotal: ${peso(order.subtotal)}<br/>Fee: ${order.fee ? peso(order.fee) : 'Free'}<br/><strong>Total: ${peso(order.total)}</strong></p>
    ${fulfillment}
    ${order.note ? `<p style="font-style:italic;color:#68705A;">“${esc(order.note)}”</p>` : ''}
    <p style="font-size:12px;color:#888;">Track it live: reply STOP to opt out of SMS-style updates. Questions? Just reply to this email.</p>
  </div>`
}

async function send(to: string, subject: string, html: string, key: string, from: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
  return res.json()
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const key = Deno.env.get('RESEND_API_KEY')
    const from = Deno.env.get('EMAIL_FROM')
    const shop = Deno.env.get('SHOP_EMAIL') || ''
    if (!key || !from) throw new Error('Missing RESEND_API_KEY / EMAIL_FROM secrets')
    const { type, order } = await req.json()
    if (type !== 'order-confirmation' || !order?.customer_email || !order?.ref) {
      throw new Error('Expected { type: "order-confirmation", order: { ref, customer_email, … } }')
    }
    const html = receiptHtml(order)
    await send(order.customer_email, `Order ${order.ref} confirmed — Alegre × Good Habits`, html, key, from)
    if (shop) {
      await send(
        shop,
        `New order ${order.ref} — ${peso(order.total)} (${order.order_type})`,
        `<p><strong>${esc(order.customer_name)}</strong> · ${esc(order.customer_phone)} · ${esc(order.customer_email)}</p>` + html,
        key,
        from
      )
    }
    return new Response(JSON.stringify({ ok: true }), { headers: cors })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String((err as Error)?.message || err) }), {
      status: 400,
      headers: cors,
    })
  }
})
