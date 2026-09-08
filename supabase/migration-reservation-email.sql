-- ============================================================
-- ALEGRE × GOOD HABITS — reservation emails need an address
-- Run once in SQL Editor. Safe to re-run (idempotent).
-- Existing rows keep email NULL and simply skip status emails.
-- ============================================================

alter table public.reservations
  add column if not exists email text;
