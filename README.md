# Alegre × Good Habits

**Coffee. Clothes. Good Habits.**

A premium editorial e-commerce site for a hybrid specialty coffee shop (Alegre) and curated thrift store (Good Habits) in one physical space — built with React + Vite, designed to run entirely on free infrastructure (Cloudflare Pages + Supabase).

## Stack

| Layer | Tech |
| --- | --- |
| UI | React 19, Vite, React Router 7 |
| Motion | Framer Motion |
| Icons | Lucide React |
| Styling | Plain CSS (`src/App.css` → `src/styles/*`), no Tailwind |
| Backend | Supabase (Postgres, Auth, Storage) |

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
```

The site runs **fully in demo mode** with realistic mock data — no backend required. Cart, checkout, orders, reservations and accounts all work locally (demo orders auto-advance through the status flow so `/orders/:ref` feels alive).

## Connect Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, paste and run `supabase/schema.sql`. It creates all tables, triggers, RLS policies, the `product-images` storage bucket, and seeds categories.
3. Copy `.env.example` → `.env` and fill in your Project URL + anon key (Project Settings → API):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

4. Restart `npm run dev`. Auth, order persistence and reservations now hit Supabase.

## Email: sign-up confirmations, resets, receipts

Supabase Auth sends **confirmation** and **password-reset** emails automatically — no code needed, just dashboard config:

1. **Authentication → Sign In / Up** → enable **Confirm email**.
2. **Authentication → URL Configuration**:
   - Site URL → your live domain (e.g. `https://alegrexgoodhabits.com`).
   - Redirect URLs → add `https://yourdomain.com/auth/callback` and `https://yourdomain.com/auth/reset` (plus `http://localhost:5173/auth/callback` for dev).
3. Set `VITE_SITE_URL` to the same domain (`.env`) so email links land back on your site.
4. **Authentication → Emails**: default SMTP works for testing; for live, add a custom SMTP host (Resend/Postmark) and tweak the Confirm/Reset templates. Keep token expiry ≤ 24h.
5. Recommended: **Authentication → Policies** → password minimum 8 characters (the sign-up form already enforces 8+).

**Order receipts** go through the `send-email` edge function (`supabase/functions/send-email/`) + Resend:

```bash
supabase functions deploy send-email
supabase secrets set RESEND_API_KEY=... EMAIL_FROM="Alegre × Good Habits <hello@yourdomain.com>" SHOP_EMAIL=orders@yourdomain.com
```

Checkout calls it fire-and-forget after every order: the customer gets a receipt, the shop gets a new-order ping. If email isn't configured yet, checkout still succeeds — the call just no-ops.

**Make yourself an admin** after signing up:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

`/admin` requires a signed-in session; with Supabase connected, gate it further by checking `role = 'admin'` in `src/App.jsx` (`RequireAdmin`).

## Routes

```
/                 Homepage (hero, drop countdown, coffee × clothes pairings, space gallery…)
/menu             Coffee menu, filterable by category
/menu/:slug       Coffee product — size, milk, sugar, add-ons, pairings
/shop             Thrift store — search, category, size, price, condition, brand, sort
/shop/:slug       Thrift piece — gallery, measurements, one-of-one reservation, sold state
/events           Upcoming + past events with RSVP
/about            Brand story
/reservations     Table booking with confirmation
/cart             Unified cart (coffee + thrift in one checkout)
/checkout         Pickup/delivery, cash or PayMongo (GCash, GrabPay, cards)
/checkout/success Payment verification landing page (PayMongo redirect)
/orders/:ref      Animated order tracking (received → confirmed → preparing → ready → completed)
/auth             Sign in / register (Supabase Auth)
/account          Profile, orders, favorites, Good Habits Rewards
/admin            Dashboard: overview, products (coffee/thrift), orders, inventory,
                  customers, reservations, events, promotions, reports
```

## Online payments (PayMongo)

Checkout offers cash plus PayMongo Links (GCash, GrabPay, cards). The shop never
touches card data — customers pay on PayMongo's hosted page.

Setup (all in your Supabase project + a free PayMongo account):

1. PayMongo dashboard → Developers → get **test** keys first (`sk_test_…`).
2. SQL Editor → run `supabase/migration-payments.sql`.
3. Secrets + deploy the function:
   ```bash
   supabase secrets set PAYMONGO_SECRET_KEY=sk_test_... SITE_URL=https://yourdomain.com
   supabase functions deploy paymongo
   ```
4. Test with PayMongo's test e-wallets/cards, then swap to `sk_live_…` and repeat step 3.
5. Recommended: PayMongo dashboard → Webhooks → add
   `https://xxxx.supabase.co/functions/v1/paymongo` with event
   `link.payment.paid` — auto-marks orders paid even if the customer closes
   the tab instead of returning. (The success page also verifies on return,
   and every paid claim is re-checked with PayMongo's API before writing.)

1. Push this repo to GitHub.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → **Connect to Git**.
3. Build settings:
   - Framework preset: **Vite** (or none)
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Deploy. `public/_redirects` already routes all paths to `index.html` for React Router.

## Design system

- **Palette** — Espresso `#211A17`, Cream `#F5F1E8`, Off-white `#FAF9F6`, Muted Olive `#68705A`, Burgundy `#713F3F`
- **Type** — Fraunces (editorial serif) + Archivo (grotesk sans), Google Fonts
- **Imagery** — every image slot renders a designed editorial "photograph" via `src/lib/placeholder.js`: a tonal-gradient scene with top-light glow, 14 subject motifs (espresso cup + steam, latte art, iced glass, matcha, croissant, banana loaf, tee print, denim jacket, clothing rack, arch, rings, cross marks, diagonal stripes, stitching, coffee beans), film grain, vignette and a caption strip — so the site looks shot on film, not empty. Drop a real URL onto any product's `src` and it fades in above the placeholder automatically. Real photos belong in the Supabase `product-images` bucket.

## Notes & conventions

- Prices are whole pesos (₱850); formatting in `src/lib/format.js`.
- One-of-one thrift pieces are locked to qty 1 in the cart and show **SOLD** states; see the schema notes for a DB-level trigger if you want belt-and-braces enforcement.
- Demo data lives in `src/data/*`; the Supabase data-access seams are `src/lib/supabase.js`, `src/lib/api.js`, and `src/lib/orders.js`.
