-- ============================================================
-- ALEGRE × GOOD HABITS — delivery GPS pins on orders
-- Run once in SQL Editor. Safe to re-run (idempotent).
-- Customers can attach their phone GPS to delivery orders;
-- riders open it straight in Google Maps from the admin panel.
-- ============================================================

alter table public.orders
  add column if not exists delivery_lat double precision;

alter table public.orders
  add column if not exists delivery_lng double precision;
