-- ============================================================================
-- MENARA — Page visitor tracking (bagian 1: tabel + RPC)
-- ============================================================================
-- Jalankan di: Supabase Dashboard → SQL Editor → New query → Run.
-- Menghitung berapa kali halaman publik dikunjungi (homepage, katalog,
-- promo kemerdekaan). Angka ditampilkan di dashboard admin.
--
-- Model keamanan: anon HANYA bisa memanggil RPC increment_page_views()
-- (security definer) dan SELECT. Tidak bisa insert/update/delete langsung.
-- ============================================================================

-- Table: page_views (satu baris per halaman)
create table if not exists public.page_views (
  page       text primary key,
  views      bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- RPC: tambah kunjungan secara atomik (upsert). Dipanggil dari client.
create or replace function public.increment_page_views(p_page text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.page_views (page, views) values (p_page, 1)
  on conflict (page) do update set
    views = public.page_views.views + 1,
    updated_at = now();
end;
$$;

grant execute on function public.increment_page_views(text) to anon, authenticated;

-- RLS: baca boleh anon + authenticated; tulis TIDAK (hanya lewat RPC).
alter table public.page_views enable row level security;

drop policy if exists "page_views_public_read" on public.page_views;
create policy "page_views_public_read" on public.page_views
  for select to anon, authenticated using (true);

-- Seed baris default supaya dashboard admin selalu punya data.
insert into public.page_views (page, views) values
  ('homepage', 0),
  ('katalog', 0),
  ('promo-bulan-ini', 0)
on conflict (page) do nothing;
