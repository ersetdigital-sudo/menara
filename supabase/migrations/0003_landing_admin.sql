-- ============================================================================
-- MENARA — Landing page admin migration
-- ============================================================================
-- Run this in the Supabase SQL Editor AFTER 0001_init.sql and
-- 0002_brand_menara.sql.
--
-- Adds the `identity` column to reviews (customer role/community) and
-- creates the `trust_badges` table so ALL landing-page content becomes
-- editable from the admin panel.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Add identity column to reviews
-- (customer role/community, e.g. "Kapten Tim Futsal")
-- ----------------------------------------------------------------------------
alter table public.reviews add column if not exists identity text;

-- Backfill identity for existing seeded reviews.
update public.reviews set identity = 'Kapten Tim Futsal'    where name = 'Dimas Pratama'  and identity is null;
update public.reviews set identity = 'Koordinator Komunitas' where name = 'Rizky Maulana' and identity is null;
update public.reviews set identity = 'Tim Hockey Bandung'   where name = 'Andi Saputra'  and identity is null;

-- ----------------------------------------------------------------------------
-- Table: trust_badges (landing page trust badge grid)
-- ----------------------------------------------------------------------------
create table if not exists public.trust_badges (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  subtext     text,
  icon        text,
  variant     text not null default 'neutral' check (variant in ('neutral', 'filled', 'success', 'warning', 'info')),
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists trust_badges_sort_order_idx
  on public.trust_badges(sort_order);

-- ----------------------------------------------------------------------------
-- RLS for trust_badges (same pattern as other tables)
-- ----------------------------------------------------------------------------
alter table public.trust_badges enable row level security;

do $$ begin
  perform public.drop_policy('trust_badges', 'trust_badges_public_read');
  execute format(
    'create policy %I on public.%I for select to anon, authenticated using (true);',
    'trust_badges_public_read', 'trust_badges'
  );
  perform public.drop_policy('trust_badges', 'trust_badges_auth_insert');
  execute format(
    'create policy %I on public.%I for insert to authenticated with check (true);',
    'trust_badges_auth_insert', 'trust_badges'
  );
  perform public.drop_policy('trust_badges', 'trust_badges_auth_update');
  execute format(
    'create policy %I on public.%I for update to authenticated using (true) with check (true);',
    'trust_badges_auth_update', 'trust_badges'
  );
  perform public.drop_policy('trust_badges', 'trust_badges_auth_delete');
  execute format(
    'create policy %I on public.%I for delete to authenticated using (true);',
    'trust_badges_auth_delete', 'trust_badges'
  );
end $$;

-- ----------------------------------------------------------------------------
-- updated_at trigger for trust_badges
-- ----------------------------------------------------------------------------
drop trigger if exists trust_badges_touch_updated_at on public.trust_badges;
create trigger trust_badges_touch_updated_at
  before update on public.trust_badges
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- Seed trust_badges (mirrors lib/data.ts)
-- ----------------------------------------------------------------------------
delete from public.trust_badges;

insert into public.trust_badges (label, subtext, icon, variant, sort_order) values
  ('Bahan Premium',        'Kualitas terbaik',   'ShieldIcon', 'success', 1),
  ('Desain Bebas',         'Sesuai keinginanmu', 'PaletteIcon', 'info',    2),
  ('Harga Pabrik',         'Lebih hemat',        'TagIcon',    'neutral', 3),
  ('Kirim Se-Indonesia',   'Aman & terpercaya',  'TruckIcon',  'success', 4);