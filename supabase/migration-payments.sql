-- ============================================================
-- ALEGRE × GOOD HABITS — PayMongo payments on orders
-- Run once in SQL Editor. Safe to re-run (idempotent).
-- payment_method: 'cash_pickup' (default) or 'paymongo'
-- payment_status: 'unpaid' → 'paid' | 'failed' (cash orders stay 'unpaid'
--   and are settled in person; only paymongo orders transition)
-- ============================================================

alter table public.orders
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'failed'));

alter table public.orders
  add column if not exists payment_link_id text;

alter table public.orders
  add column if not exists payment_link_url text;

alter table public.orders
  add column if not exists paid_at timestamptz;
