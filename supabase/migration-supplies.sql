-- ============================================================
-- ALEGRE × GOOD HABITS — consumables (coffee supplies) table
-- Run once in SQL Editor, after supabase/schema.sql.
-- Safe to re-run (idempotent): table + policies created if missing,
-- seed rows insert only when their slug is absent.
-- ============================================================

create table if not exists public.supplies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  unit text not null default 'pcs',
  stock numeric(12,2) not null default 0,
  par numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.supplies enable row level security;

create policy "supplies read" on public.supplies
  for select using (true);
create policy "supplies admin write" on public.supplies
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.supplies (slug, name, unit, stock, par) values
  ('house-blend-beans', 'House blend beans', 'kg', 4, 12),
  ('single-origin-ethiopia', 'Single origin — Ethiopia', 'kg', 7, 8),
  ('whole-milk', 'Whole milk', 'L', 20, 24),
  ('oat-milk', 'Oat milk', 'L', 12, 18),
  ('vanilla-syrup', 'Vanilla syrup', 'bottles', 2, 6),
  ('caramel-syrup', 'Caramel syrup', 'bottles', 8, 6),
  ('cups-8oz', '8oz cups', 'pcs', 350, 400),
  ('cups-12oz', '12oz cups', 'pcs', 180, 400),
  ('croissants-frozen', 'Croissants (frozen)', 'pcs', 24, 30),
  ('matcha-ceremonial', 'Matcha (ceremonial)', 'g', 900, 1000)
on conflict (slug) do nothing;
