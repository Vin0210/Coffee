// ============================================================
// ALEGRE × GOOD HABITS — send-email edge function (Deno)
// Sends transactional mail via Resend: order receipts to customers
// plus a new-order notification to the shop.
// Deploy:  supabase functions deploy send-email
// Secrets: supabase secrets set RESEND_API_KEY=... EMAIL_FROM=... SHOP_EMAIL=...
//   RESEND_API_KEY  resend.com → API Keys
//   EMAIL_FROM      verified sender, e.g. "Alegre × Good Habits <hello@alegrexgoodhabits.com>"
//   SHOP_EMAIL      where new-order notifications go, e.g. orders@alegrexgoodhabits.com
//   SITE_URL        optional, defaults to https://alegrexgoodhabits.pages.dev (used for track-order links)
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

const siteUrl = () => (Deno.env.get('SITE_URL') || 'https://alegrexgoodhabits.pages.dev').replace(/\/$/, '')

/** Shared branded shell — table layout + inline styles for email clients. */
function shell(preview: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background-color:#F5F1E8;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preview)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;">
          <tr><td style="background-color:#211A17;padding:28px 36px;text-align:center;">
            <p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#F5F1E8;">Alegre <span style="color:#A9B28F;">×</span> <em>Good Habits</em></p>
            <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#A9B28F;">Coffee · Clothes · Good Habits</p>
          </td></tr>
          <tr><td style="padding:36px;font-family:Georgia,serif;color:#211A17;">${body}</td></tr>
          <tr><td style="padding:24px 36px;border-top:1px solid #E9E2D2;font-family:Arial,sans-serif;">
            <p style="margin:0;font-size:12px;color:#68705A;">Tumaga - Putik Rd, Zamboanga City · Mon–Thu 8AM–9PM · Fri–Sat 8AM–12MN · Sun 9AM–8PM</p>
            <p style="margin:8px 0 0;font-size:12px;color:#999;">Questions? Just reply to this email — a human reads every one.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`
}

function receiptHtml(order: any): string {
  const firstName = esc(order.customer_name?.split(' ')[0] || 'friend')
  const rows = (order.items || [])
    .map(
      (i: any) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #EFE9DB;font-family:Georgia,serif;font-size:15px;">${esc(i.name)} <span style="color:#68705A;font-size:13px;">× ${esc(i.qty)}</span></td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid #EFE9DB;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">${peso(i.line_total)}</td>
      </tr>`
    )
    .join('')
  const isDelivery = order.order_type === 'delivery'
  const fulfillmentTitle = isDelivery ? 'Delivering to' : 'Pickup'
  const fulfillmentDetail = isDelivery
    ? esc(order.address)
    : `${esc(order.pickup_time || 'ASAP (15–20 min)')} · Alegre × Good Habits, Tumaga - Putik Rd`
  const body = `
    <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.22em;text-transform:uppercase;color:#713F3F;">Order confirmed</p>
    <h1 style="margin:12px 0 0;font-weight:400;font-size:30px;line-height:1.2;">Thanks, ${firstName}.</h1>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#4a423c;">We're on it — show reference <strong style="font-family:Arial,sans-serif;letter-spacing:0.06em;">${esc(order.ref)}</strong> at the counter.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">${rows}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:14px;">
      <tr><td style="padding:4px 0;color:#68705A;">Subtotal</td><td align="right" style="padding:4px 0;">${peso(order.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;color:#68705A;">${isDelivery ? 'Delivery' : 'Pickup'}</td><td align="right" style="padding:4px 0;">${order.fee ? peso(order.fee) : 'Free'}</td></tr>
      <tr><td style="padding:12px 0 0;font-weight:bold;font-size:16px;">Total</td><td align="right" style="padding:12px 0 0;font-weight:bold;font-size:20px;font-family:Georgia,serif;">${peso(order.total)}</td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;background-color:#F5F1E8;border-radius:8px;">
      <tr><td style="padding:18px 20px;font-family:Arial,sans-serif;">
        <p style="margin:0;font-size:10px;font-weight:bold;letter-spacing:0.2em;text-transform:uppercase;color:#68705A;">${fulfillmentTitle}</p>
        <p style="margin:8px 0 0;font-size:14px;color:#211A17;">${fulfillmentDetail}</p>
      </td></tr>
    </table>
    ${order.note ? `<p style="margin:20px 0 0;font-style:italic;font-size:14px;color:#68705A;">“${esc(order.note)}”</p>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
      <tr><td align="center">
        <a href="${siteUrl()}/orders/${esc(order.ref)}" style="display:inline-block;background-color:#211A17;color:#F5F1E8;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;padding:15px 34px;border-radius:999px;">Track your order</a>
      </td></tr>
    </table>`
  return shell(`Order ${order.ref} confirmed — ${peso(order.total)} at Alegre × Good Habits.`, body)
}

function welcomeHtml(): string {
  const body = `
    <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.22em;text-transform:uppercase;color:#713F3F;">Good Mail</p>
    <h1 style="margin:12px 0 0;font-weight:400;font-size:30px;line-height:1.2;">You’re in.</h1>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#4a423c;">Drops, events, and one-of-one finds — once a week, no noise. First mail lands Friday.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
      <tr><td align="center">
        <a href="${siteUrl()}/shop" style="display:inline-block;background-color:#211A17;color:#F5F1E8;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;padding:15px 34px;border-radius:999px;">Browse the racks</a>
      </td></tr>
    </table>`
  return shell('You’re on the Good Mail list — drops, events, and finds, weekly.', body)
}

function statusCta(label: string, href: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr><td align="center">
      <a href="${href}" style="display:inline-block;background-color:#211A17;color:#F5F1E8;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;padding:15px 34px;border-radius:999px;">${label}</a>
    </td></tr>
  </table>`
}

function reservationReceivedHtml(r: any): string {
  const when = `${esc(r.date)} · ${esc(r.time)} · ${esc(r.guests)} guest${Number(r.guests) > 1 ? 's' : ''}`
  const body = `
    <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.22em;text-transform:uppercase;color:#713F3F;">Reservation received</p>
    <h1 style="margin:12px 0 0;font-weight:400;font-size:30px;line-height:1.2;">See you soon, ${esc(r.name?.split(' ')[0] || 'friend')}.</h1>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#4a423c;">Your request <strong style="font-family:Arial,sans-serif;letter-spacing:0.06em;">${esc(r.ref)}</strong> is in — we confirm every table personally, usually within the hour.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;background-color:#F5F1E8;border-radius:8px;">
      <tr><td style="padding:18px 20px;font-family:Arial,sans-serif;">
        <p style="margin:0;font-size:10px;font-weight:bold;letter-spacing:0.2em;text-transform:uppercase;color:#68705A;">Requested</p>
        <p style="margin:8px 0 0;font-size:14px;color:#211A17;">${when}</p>
        ${r.request ? `<p style="margin:8px 0 0;font-size:14px;font-style:italic;color:#68705A;">“${esc(r.request)}”</p>` : ''}
      </td></tr>
    </table>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#68705A;">Tables are held for 15 minutes past the reserved time. Need to change anything? Just reply to this email.</p>`
  return shell(`Table request ${r.ref} received — ${when}.`, body)
}

function reservationStatusHtml(r: any, status: string): string {
  const when = `${esc(r.date)} · ${esc(r.time)} · ${esc(r.guests)} guest${Number(r.guests) > 1 ? 's' : ''}`
  if (status === 'confirmed') {
    const body = `
      <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.2em;text-transform:uppercase;color:#68705A;">Table confirmed</p>
      <h1 style="margin:12px 0 0;font-weight:400;font-size:30px;line-height:1.2;">You're booked, ${esc(r.name?.split(' ')[0] || 'friend')}.</h1>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;background-color:#F5F1E8;border-radius:8px;">
        <tr><td style="padding:18px 20px;font-family:Arial,sans-serif;">
          <p style="margin:0;font-size:10px;font-weight:bold;letter-spacing:0.2em;text-transform:uppercase;color:#68705A;">${esc(r.ref || 'Reservation')}</p>
          <p style="margin:8px 0 0;font-size:14px;color:#211A17;">${when}<br/>Alegre × Good Habits, Tumaga - Putik Rd</p>
        </td></tr>
      </table>
      <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#68705A;">Held for 15 minutes past your time. Come hungry — or at least thirsty.</p>`
    return shell(`Table confirmed — ${when}.`, body)
  }
  const body = `
    <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.2em;text-transform:uppercase;color:#713F3F;">Reservation cancelled</p>
    <h1 style="margin:12px 0 0;font-weight:400;font-size:30px;line-height:1.2;">Maybe next time.</h1>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#4a423c;">Your request for ${when} has been cancelled — no charge, no hard feelings. Walk-ins are always welcome.</p>`
  return shell(`Reservation ${r.ref || ''} cancelled.`, body)
}

function orderStatusHtml(o: any, status: string): string {
  const firstName = esc(o.customer_name?.split(' ')[0] || 'friend')
  const ready = status === 'ready'
  const headline = ready ? 'Your order is ready.' : 'Order complete — thanks.'
  const detail = ready
    ? (o.order_type === 'delivery'
      ? `Your order <strong>${esc(o.ref)}</strong> is packed and on its way to ${esc(o.address || 'you')}.`
      : `Your order <strong>${esc(o.ref)}</strong> is waiting at the counter — show this reference to pick it up.`)
    : `Order <strong>${esc(o.ref)}</strong> is complete. Every cup and every find earns Good Habits Rewards points — see you next time.`
  const body = `
    <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.22em;text-transform:uppercase;color:${ready ? '#68705A' : '#713F3F'};">${ready ? 'Ready' : 'Completed'}</p>
    <h1 style="margin:12px 0 0;font-weight:400;font-size:30px;line-height:1.2;">${headline}</h1>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#4a423c;">Hi ${firstName} — ${detail}</p>
    ${statusCta('Track your order', `${siteUrl()}/orders/${esc(o.ref)}`)}`
  return shell(`Order ${o.ref} — ${ready ? 'ready' : 'completed'}.`, body)
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
    const { type, order, email, reservation, status } = await req.json()
    if (type === 'newsletter-welcome' && email) {
      await send(
        String(email),
        'You’re on the list — Alegre × Good Habits',
        welcomeHtml(),
        key,
        from
      )
      return new Response(JSON.stringify({ ok: true }), { headers: cors })
    }
    if (type === 'reservation-received' && reservation?.email) {
      await send(
        String(reservation.email),
        `Table request received — Alegre × Good Habits`,
        reservationReceivedHtml(reservation),
        key,
        from
      )
      return new Response(JSON.stringify({ ok: true }), { headers: cors })
    }
    if (type === 'reservation-status' && reservation?.email && reservation?.status) {
      await send(
        String(reservation.email),
        reservation.status === 'confirmed'
          ? `Table confirmed — Alegre × Good Habits`
          : `Reservation update — Alegre × Good Habits`,
        reservationStatusHtml(reservation, reservation.status),
        key,
        from
      )
      return new Response(JSON.stringify({ ok: true }), { headers: cors })
    }
    if (type === 'order-status' && order?.customer_email && order?.ref && order?.status) {
      const s = String(order.status)
      if (s !== 'ready' && s !== 'completed') throw new Error('order-status supports ready/completed')
      await send(
        String(order.customer_email),
        s === 'ready' ? `Your order is ready — Alegre × Good Habits` : `Thanks — order ${order.ref} completed`,
        orderStatusHtml(order, s),
        key,
        from
      )
      return new Response(JSON.stringify({ ok: true }), { headers: cors })
    }
    if (type !== 'order-confirmation' || !order?.customer_email || !order?.ref) {
      throw new Error('Expected order-confirmation, order-status, reservation-received, reservation-status, or newsletter-welcome')
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
