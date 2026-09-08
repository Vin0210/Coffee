-- ============================================================
-- ALEGRE × GOOD HABITS — Supabase / PostgreSQL schema
-- Run this whole file in: Supabase Dashboard → SQL Editor → New query
-- Safe to re-run (idempotent).
-- ============================================================

create extension if not exists "pgcrypto";

-- ============ PROFILES ============
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text default '',
  phone text default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  points integer not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin helper (security definer avoids RLS recursion)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), '') = 'admin';
$$;

-- ============ CATALOG ============
create table if not exists public.categories (
  id serial primary key,
  slug text unique not null,
  name text not null,
  type text not null check (type in ('coffee', 'thrift'))
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type text not null check (type in ('coffee', 'thrift')),
  category text not null,
  name text not null,
  short_desc text default '',
  description text default '',
  price numeric(10,2) not null check (price >= 0),
  stock integer not null default 0,
  brand text,
  size text,
  condition_grade integer check (condition_grade between 1 and 10),
  measurements jsonb default '{}'::jsonb,
  -- coffee: {"sizes":[{"label":"8oz","delta":0}],"milks":[...],"addons":[{"label":"Extra shot","price":35}],"sugar":true}
  options jsonb default '{}'::jsonb,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  collection text,
  created_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  sort integer not null default 0
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  kind text not null check (kind in ('size', 'addon')),
  label text not null,
  price_delta numeric(10,2) not null default 0,
  sort integer not null default 0
);

-- ============ ORDERS ============
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  user_id uuid references auth.users (id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  order_type text not null default 'pickup' check (order_type in ('pickup', 'delivery')),
  address text,
  pickup_time text,
  payment_method text not null default 'cash_pickup',
  -- future-ready: add 'gcash', 'card' + paid_at / payment_ref columns when online payments ship
  subtotal numeric(10,2) not null default 0,
  fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  status text not null default 'received'
    check (status in ('received', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  name text not null,
  unit_price numeric(10,2) not null,
  qty integer not null default 1 check (qty > 0),
  options jsonb default '{}'::jsonb,
  line_total numeric(10,2) not null
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- ============ CUSTOMER DATA ============
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  qty integer not null default 1 check (qty > 0),
  options jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  phone text not null,
  date date not null,
  time text not null,
  guests integer not null default 2 check (guests between 1 and 20),
  request text default '',
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text default '',
  date date not null,
  time text,
  location text default 'Alegre × Good Habits — Tumaga - Putik Rd, Zamboanga City',
  slots text,
  status text not null default 'upcoming' check (status in ('upcoming', 'past')),
  image text,
  created_at timestamptz not null default now()
);

create table if not exists public.loyalty_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  points integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text default '',
  kind text not null default 'percent' check (kind in ('percent', 'fixed', 'perk')),
  value numeric(10,2) default 0,
  active boolean not null default true,
  uses integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============ INDEXES ============
create index if not exists idx_products_type on public.products (type);
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_orders_user on public.orders (user_id);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_order_items_order on public.order_items (order_id);
create index if not exists idx_product_images_product on public.product_images (product_id);

-- ============ ROW LEVEL SECURITY ============
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;
alter table public.favorites enable row level security;
alter table public.reservations enable row level security;
alter table public.events enable row level security;
alter table public.loyalty_points enable row level security;
alter table public.promotions enable row level security;

-- profiles: read/update own; admins read all
create policy "profiles select own or admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- catalog: world-readable, admin-writable
create policy "catalog read" on public.products for select using (true);
create policy "catalog write" on public.products for insert with check (public.is_admin());
create policy "catalog update" on public.products for update using (public.is_admin());
create policy "catalog delete" on public.products for delete using (public.is_admin());
create policy "categories read" on public.categories for select using (true);
create policy "categories write" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());
create policy "images read" on public.product_images for select using (true);
create policy "images write" on public.product_images for all
  using (public.is_admin()) with check (public.is_admin());
create policy "variants read" on public.product_variants for select using (true);
create policy "variants write" on public.product_variants for all
  using (public.is_admin()) with check (public.is_admin());

-- events & promotions: readable, admin-writable
create policy "events read" on public.events for select using (true);
create policy "events write" on public.events for all
  using (public.is_admin()) with check (public.is_admin());
create policy "promos read" on public.promotions for select using (true);
create policy "promos write" on public.promotions for all
  using (public.is_admin()) with check (public.is_admin());

-- orders: signed-in users create & read their own; guests handled client-side;
-- only admins can change status after creation
create policy "orders insert own or guest" on public.orders
  for insert with check (user_id is null or user_id = auth.uid());
create policy "orders select own or admin" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
create policy "orders admin update" on public.orders
  for update using (public.is_admin());

create policy "order items read via order" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "order items insert via order" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- per-user data
create policy "cart own" on public.cart_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "favorites own" on public.favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reservations: anyone can request; admins manage
create policy "reservations insert" on public.reservations
  for insert with check (true);
create policy "reservations select own or admin" on public.reservations
  for select using (user_id = auth.uid() or public.is_admin());
create policy "reservations admin update" on public.reservations
  for update using (public.is_admin());

-- loyalty: read own, write via admin/service role
create policy "loyalty select own" on public.loyalty_points
  for select using (user_id = auth.uid() or public.is_admin());
create policy "loyalty admin write" on public.loyalty_points
  for insert with check (public.is_admin());

-- ============ STORAGE (product images) ============
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product images public read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product images admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "product images admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
create policy "product images admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ============ SEED CATEGORIES ============
insert into public.categories (slug, name, type) values
  ('espresso', 'Espresso', 'coffee'),
  ('milk-coffee', 'Milk Coffee', 'coffee'),
  ('cold-coffee', 'Cold Coffee', 'coffee'),
  ('specialty', 'Specialty', 'coffee'),
  ('non-coffee', 'Non-Coffee', 'coffee'),
  ('pastries', 'Pastries', 'coffee'),
  ('tops', 'Tops', 'thrift'),
  ('bottoms', 'Bottoms', 'thrift'),
  ('outerwear', 'Outerwear', 'thrift'),
  ('denim', 'Denim', 'thrift'),
  ('accessories', 'Accessories', 'thrift'),
  ('footwear', 'Footwear', 'thrift')
on conflict (slug) do nothing;

-- ============ NOTES ============
-- 1. Make yourself an admin after signing up:
--    update public.profiles set role = 'admin' where email = 'you@example.com';
-- 2. Guest (not signed in) orders live in the browser by design; signed-in
--    orders persist to `orders`. For guest orders in Postgres, relax the
--    orders insert policy or add an edge function with the service key.
-- 3. One-of-one thrift is enforced client-side (qty locked to 1) — for a
--    bulletproof guarantee, add a trigger that flips `is_available` to false
--    when an order_item for a thrift product is created.
