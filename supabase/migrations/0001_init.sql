-- ============================================================================
-- TCC Jersey — Supabase schema initialization
-- ============================================================================
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- This migration is IDEMPOTENT: re-running it will not fail on existing
-- objects (uses IF NOT EXISTS / OR REPLACE) but will overwrite seed data
-- for the landing tables via upserts. Product data is never touched on
-- re-runs once it has been created via the admin UI.
--
-- SECURITY MODEL:
--   * Public (anon) can READ all rows in every table (the landing page
--     and catalog pages need to fetch content without authentication).
--   * Only authenticated users (admins, via Supabase Auth) can WRITE.
--   * No row-level per-user isolation — any logged-in admin manages all
--     content. This is intentional for a small internal team.
-- ============================================================================

-- Required extension for gen_random_uuid() in case it isn't enabled.
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- ENUM types
-- ----------------------------------------------------------------------------
do $$ begin
  create type cta_accent as enum ('whatsapp', 'primary', 'warning', 'neutral');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stock_status as enum ('in_stock', 'limited', 'out_of_stock');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_size as enum ('S', 'M', 'L', 'XL', 'XXL');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- Table: brand (single row, id = 1)
-- ----------------------------------------------------------------------------
create table if not exists public.brand (
  id              smallint primary key default 1 check (id = 1),
  name            text not null,
  accent_word     text not null,
  monogram        text not null,
  tagline         text not null,
  url             text not null,
  description     text not null,
  whatsapp_number text not null,
  logo_path       text not null default '/logo.svg',
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Table: stats (landing page stats grid)
-- ----------------------------------------------------------------------------
create table if not exists public.stats (
  id          uuid primary key default gen_random_uuid(),
  value       text not null,
  label       text not null,
  icon        text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Table: cta_links (link-in-bio style CTAs)
-- ----------------------------------------------------------------------------
create table if not exists public.cta_links (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,
  href        text,
  accent      cta_accent not null default 'neutral',
  icon        text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Table: reviews (customer testimonials)
-- ----------------------------------------------------------------------------
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  rating      smallint not null check (rating between 1 and 5),
  quote       text not null,
  name        text not null,
  location    text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Table: social_links (5-icon social grid)
-- ----------------------------------------------------------------------------
create table if not exists public.social_links (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  href        text not null,
  icon        text not null,
  aria_label  text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Table: product_categories (self-referencing for multi-level)
-- ----------------------------------------------------------------------------
create table if not exists public.product_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  parent_id   uuid references public.product_categories(id) on delete set null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists product_categories_parent_id_idx
  on public.product_categories(parent_id);

-- ----------------------------------------------------------------------------
-- Table: products
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  description   text,
  price         integer not null check (price >= 0),
  category_id   uuid references public.product_categories(id) on delete set null,
  stock_status  stock_status not null default 'in_stock',
  featured      boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_featured_idx on public.products(featured);
create index if not exists products_stock_status_idx on public.products(stock_status);

-- ----------------------------------------------------------------------------
-- Table: product_images (multiple images per product, ordered)
-- ----------------------------------------------------------------------------
create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images(product_id);

-- ----------------------------------------------------------------------------
-- Table: product_variants (size + stock per product)
-- ----------------------------------------------------------------------------
create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  size        product_size not null,
  stock_qty   integer not null default 0 check (stock_qty >= 0),
  price_delta integer not null default 0,
  created_at  timestamptz not null default now(),
  unique (product_id, size)
);

create index if not exists product_variants_product_id_idx on public.product_variants(product_id);

-- ----------------------------------------------------------------------------
-- updated_at triggers — keep the timestamp column current automatically.
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$ declare t text;
begin
  foreach t in array array[
    'brand', 'stats', 'cta_links', 'reviews', 'social_links',
    'product_categories', 'products', 'product_images', 'product_variants'
  ] loop
    execute format(
      'drop trigger if exists %I_touch_updated_at on public.%I;', t, t
    );
    execute format(
      'create trigger %I_touch_updated_at before update on public.%I '
      'for each row execute function public.touch_updated_at();', t, t
    );
  end loop;
end $$;

-- ============================================================================
-- Row Level Security
-- ============================================================================
-- Enable RLS on every table. Public users (anon role) can read; only
-- authenticated users can write. This is what makes the anon key safe
-- to ship in client-side code.
alter table public.brand              enable row level security;
alter table public.stats              enable row level security;
alter table public.cta_links          enable row level security;
alter table public.reviews            enable row level security;
alter table public.social_links      enable row level security;
alter table public.product_categories enable row level security;
alter table public.products           enable row level security;
alter table public.product_images     enable row level security;
alter table public.product_variants   enable row level security;

-- Helper: drop a policy if it already exists (idempotent re-runs).
create or replace function public.drop_policy(tbl text, name text)
returns void language plpgsql as $$
begin
  execute format('drop policy if exists %I on public.%I;', name, tbl);
end;
$$;

-- ----------------------------------------------------------------------------
-- Public read policies (anon + authenticated can SELECT)
-- ----------------------------------------------------------------------------
do $$ declare t text;
begin
  foreach t in array array[
    'brand', 'stats', 'cta_links', 'reviews', 'social_links',
    'product_categories', 'products', 'product_images', 'product_variants'
  ] loop
    perform public.drop_policy(t, t || '_public_read');
    execute format(
      'create policy %I on public.%I for select to anon, authenticated '
      'using (true);', t || '_public_read', t
    );
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Authenticated write policies (insert/update/delete)
-- ----------------------------------------------------------------------------
do $$ declare t text;
begin
  foreach t in array array[
    'brand', 'stats', 'cta_links', 'reviews', 'social_links',
    'product_categories', 'products', 'product_images', 'product_variants'
  ] loop
    -- INSERT
    perform public.drop_policy(t, t || '_auth_insert');
    execute format(
      'create policy %I on public.%I for insert to authenticated '
      'with check (true);', t || '_auth_insert', t
    );
    -- UPDATE
    perform public.drop_policy(t, t || '_auth_update');
    execute format(
      'create policy %I on public.%I for update to authenticated '
      'using (true) with check (true);', t || '_auth_update', t
    );
    -- DELETE
    perform public.drop_policy(t, t || '_auth_delete');
    execute format(
      'create policy %I on public.%I for delete to authenticated '
      'using (true);', t || '_auth_delete', t
    );
  end loop;
end $$;

-- ============================================================================
-- Storage bucket for product images
-- ============================================================================
-- Public read (landing/catalog pages need to display images without auth),
-- authenticated write (only admins can upload via the admin UI).
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- Storage policies (storage.objects is the table behind all buckets).
drop policy if exists "products_public_read" on storage.objects;
create policy "products_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'products');

drop policy if exists "products_auth_upload" on storage.objects;
create policy "products_auth_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'products');

drop policy if exists "products_auth_update" on storage.objects;
create policy "products_auth_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'products') with check (bucket_id = 'products');

drop policy if exists "products_auth_delete" on storage.objects;
create policy "products_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'products');

-- ============================================================================
-- Seed data — landing content (mirrors lib/data.ts so the live site matches
-- what was already shipping). Safe to re-run; upserts replace landing rows.
-- Product/catalog tables are NOT seeded here — populate them via the admin UI.
-- ============================================================================

-- brand: upsert the single row with id = 1.
insert into public.brand (id, name, accent_word, monogram, tagline, url, description, whatsapp_number, logo_path)
values (
  1,
  'TCC JERSEY',
  'JERSEY',
  'TCC',
  'Pabrik Jersey Custom Full Printing.
Desain bebas, harga pabrik, kirim se-Indonesia.',
  'https://tccjersey.id',
  'Pabrik jersey custom full printing. Desain bebas, harga mulai 85rb, kirim se-Indonesia. Konsultasi gratis via WhatsApp.',
  '6281234567890',
  '/logo.svg'
)
on conflict (id) do update set
  name            = excluded.name,
  accent_word     = excluded.accent_word,
  monogram        = excluded.monogram,
  tagline         = excluded.tagline,
  url             = excluded.url,
  description     = excluded.description,
  whatsapp_number = excluded.whatsapp_number,
  logo_path       = excluded.logo_path;

-- Wipe landing rows before re-seeding so removed items don't linger.
delete from public.stats;
delete from public.cta_links;
delete from public.reviews;
delete from public.social_links;

insert into public.stats (value, label, icon, sort_order) values
  ('350K+',  'Order Selesai',    null,     1),
  ('9K+',    'Klien Puas',       null,     2),
  ('85rb',   'Mulai Dari',       null,     3),
  ('Tepat Waktu', 'Produksi & Kirim', 'BoltIcon', 4);

insert into public.cta_links (title, description, href, accent, icon, sort_order) values
  ('Chat WhatsApp', 'Gratis konsultasi — tanya desain, harga, estimasi.',
   'https://wa.me/6281234567890?text=Halo%20TCC%20Jersey%2C%20saya%20mau%20konsultasi%20soal%20jersey%20custom.',
   'whatsapp', 'WhatsAppIcon', 1),
  ('Lihat Katalog & Harga Lengkap', 'Browse model jersey + harga mulai 85rb.',
   'https://tccjersey.id/katalog',
   'primary', 'CatalogIcon', 2),
  ('Klaim Promo Beli 6 Gratis 1', 'Promo terbatas — klaim sebelum kuota habis.',
   'https://wa.me/6281234567890?text=Halo%20TCC%20Jersey%2C%20saya%20mau%20klaim%20promo%20Beli%206%20Gratis%201.',
   'warning', 'GiftIcon', 3),
  ('Promo Beli 6 Gratis 1 — Detail', 'Belanja 6 jersey, dapatkan 1 jersey gratis. Berlaku semua model.',
   null, 'neutral', 'InfoIcon', 4);

insert into public.reviews (rating, quote, name, location, sort_order) values
  (5, 'Hasil printingnya rapi banget, warna sesuai desain. Anak tim langsung senang. Pasti repeat order!',
   'Dimas Pratama', 'Jakarta', 1),
  (5, 'Harga pabrik beneran. Order 30 jersey buat komunitas, semua ukuran pas. Recommended pol.',
   'Rizky Maulana', 'Surabaya', 2),
  (5, 'CS-nya responsif, desain direvisi sampe cocok. Pengiriman cepat ke Bandung. Top.',
   'Andi Saputra', 'Bandung', 3);

insert into public.social_links (label, href, icon, aria_label, sort_order) values
  ('WhatsApp',  'https://wa.me/6281234567890',                              'WhatsAppIcon',  'TCC Jersey di WhatsApp',    1),
  ('Instagram', 'https://instagram.com/tccjersey',                          'InstagramIcon', 'TCC Jersey di Instagram',   2),
  ('TikTok',    'https://tiktok.com/@tccjersey',                            'TikTokIcon',    'TCC Jersey di TikTok',      3),
  ('Facebook',  'https://facebook.com/tccjersey',                           'FacebookIcon',  'TCC Jersey di Facebook',    4),
  ('Maps',      'https://maps.google.com/?q=TCC+Jersey',                    'MapsIcon',      'Lokasi TCC Jersey di Google Maps', 5);

-- ============================================================================
-- ADMIN USER — create the first admin login.
-- ============================================================================
-- STEP 1 (run once, manually, in the Supabase Dashboard):
--   Authentication → Users → Add user → enter email + password →
--   tick "Auto Confirm User" → Create.
--
-- That user can now sign in at /admin/login. No further SQL is needed —
-- the RLS policies above treat every authenticated user as an admin.
--
-- To rotate the password later: Authentication → Users → click the user →
-- "Send password reset" or set a new password directly.
--
-- (We intentionally do NOT hardcode credentials here. Keeping them out of
-- version control is the whole point of using Supabase Auth instead of a
-- hand-rolled password scheme.)
-- ============================================================================
