-- ============================================================
-- ALEGRE × GOOD HABITS — newsletter subscribers (footer "Good Mail")
-- Run once in SQL Editor, after supabase/schema.sql.
-- Safe to re-run (idempotent).
-- Anyone can subscribe (public insert); only admins can read the list.
-- ============================================================

create extension if not exists "citext";

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "newsletter subscribe" on public.newsletter_subscribers
  for insert with check (true);
create policy "newsletter admin read" on public.newsletter_subscribers
  for select using (public.is_admin());
