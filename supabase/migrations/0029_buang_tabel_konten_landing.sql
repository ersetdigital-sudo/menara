-- ============================================================================
-- 0029_buang_tabel_konten_landing.sql
--
-- Aplikasi ini fokus ke dashboard OPERASIONAL: pesanan, maklon, dan tracking
-- customer. Modul landing page + katalog dibuang seluruhnya — kodenya maupun
-- tabelnya — supaya skema database mencerminkan apa yang benar-benar dipakai.
--
-- Kenapa aman: tabel-tabel di bawah tidak lagi di-query kode mana pun. Bukti
-- sebelum penghapusan: dari 13 fungsi di lib/queries.ts hanya getBrand() yang
-- dipanggil (oleh app/page.tsx dan app/layout.tsx). Tabel yang tetap dipakai
-- adalah orders, order_status_history, production_steps, app_settings,
-- notification_logs, brand, dan pasangan maklon_*.
--
-- Backup isi tabel ada di luar repo (../_backup/dormant-tables-<waktu>/),
-- berisi data.json + restore.sql. Skemanya sendiri masih bisa dibaca dari
-- migrasi 0001 → 0028.
--
-- Dijalankan SETELAH kode yang membuang modul katalog ter-deploy.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Fungsi yang bergantung pada tabel yang akan dibuang harus jalan lebih dulu.
-- increment_page_views menulis ke page_views.
-- ---------------------------------------------------------------------------
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'increment_page_views'
  loop
    execute format('drop function %s', fn.signature);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Storage: bucket `products` beserta policy-nya.
-- Bucket ini kosong (0 objek) sejak awal. Dibungkus DO/EXCEPTION karena
-- tabel storage dimiliki role lain, jadi kalau gagal izin, migrasi tetap
-- lanjut dan masalahnya dilaporkan sebagai notice.
--
-- CATATAN PRAKTIK: drop policy-nya berhasil, tapi `delete from storage.buckets`
-- GAGAL karena izin (tertangkap EXCEPTION, jadi cuma jadi notice). Bucket-nya
-- akhirnya dihapus lewat Storage API dengan service role:
--   curl -X DELETE "$SUPABASE_URL/storage/v1/bucket/products" \
--        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
-- Jadi kalau membangun ulang database dari migrasi, siapkan langkah manual itu.
-- ---------------------------------------------------------------------------
do $$
begin
  drop policy if exists "products_public_read" on storage.objects;
  drop policy if exists "products_auth_upload" on storage.objects;
  drop policy if exists "products_auth_update" on storage.objects;
  drop policy if exists "products_auth_delete" on storage.objects;
  raise notice 'policy storage bucket products dihapus';
exception when others then
  raise notice 'Gagal hapus policy storage: %', sqlerrm;
end $$;

do $$
begin
  delete from storage.objects where bucket_id = 'products';
  delete from storage.buckets where id = 'products';
  raise notice 'bucket products dihapus';
exception when others then
  raise notice 'Gagal hapus bucket products: %', sqlerrm;
end $$;

-- ---------------------------------------------------------------------------
-- Tabel konten landing/katalog.
-- Anak lebih dulu (product_images & product_variants → products → categories),
-- jadi tidak perlu CASCADE.
-- ---------------------------------------------------------------------------
drop table if exists public.product_images;
drop table if exists public.product_variants;
drop table if exists public.products;
drop table if exists public.product_categories;

drop table if exists public.katalog_features;
drop table if exists public.katalog_testimonials;
drop table if exists public.fabrics;
drop table if exists public.reviews;
drop table if exists public.social_links;
drop table if exists public.stats;
drop table if exists public.trust_badges;
drop table if exists public.cta_links;
drop table if exists public.page_views;

-- ---------------------------------------------------------------------------
-- Enum yang cuma dipakai tabel-tabel di atas.
-- ---------------------------------------------------------------------------
drop type if exists public.cta_accent;
drop type if exists public.product_size;
drop type if exists public.stock_status;

-- ---------------------------------------------------------------------------
-- Kolom `brand` yang tidak dipakai lagi. `brand` SENDIRI tetap ada dan tetap
-- dipakai (nama toko, monogram, tagline, deskripsi, nomor WhatsApp CS, logo).
--
-- Yang dibuang:
--   accent_word / url              → konten landing page + situs katalog
--   meta_pixel_id/enabled          → Meta Pixel, untuk halaman iklan
--   flash_sale_link/message        → banner flash sale di landing page
-- ---------------------------------------------------------------------------
alter table public.brand
  drop column if exists accent_word,
  drop column if exists url,
  drop column if exists meta_pixel_id,
  drop column if exists meta_pixel_enabled,
  drop column if exists flash_sale_link,
  drop column if exists flash_sale_message;

-- ---------------------------------------------------------------------------
-- VERIFIKASI (jalankan manual). Hasilnya harus 10 tabel saja:
--   select table_name from information_schema.tables
--   where table_schema = 'public' and table_type = 'BASE TABLE' order by 1;
-- ---------------------------------------------------------------------------
