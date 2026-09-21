-- ============================================================================
-- MENARA — Promo Kemerdekaan (bagian 2: seed CTA)
-- ============================================================================
-- Jalankan SETELAH 0009_promo_bulan_ini.sql (enum 'danger' sudah ada).
-- Seed CTA "Promo Kemerdekaan" ke tabel cta_links sehingga link-nya bisa
-- diubah dari /admin/cta-links. Idempotent: replace baris yang ada.
-- ============================================================================
delete from public.cta_links where title = 'Promo Kemerdekaan';

insert into public.cta_links (title, description, href, accent, icon, sort_order)
values (
  'Promo Kemerdekaan',
  'Cek promo spesial kemerdekaan & penawaran terbaru bulan ini',
  'https://www.menara.id/promo-bulan-ini',
  'danger',
  'FlameIcon',
  100
);