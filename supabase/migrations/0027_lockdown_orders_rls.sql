-- ============================================================================
-- 0027_lockdown_orders_rls.sql
--
-- MENUTUP policy RLS yang membuka tabel operasional ke role `public` (anon).
--
-- Kenapa: migrasi 0013 dan 0024 membuat policy `USING (true)` untuk SELECT,
-- INSERT, UPDATE (bahkan DELETE di maklon). Anon key tersedia publik di bundle
-- browser (env `NEXT_PUBLIC_SUPABASE_ANON_KEY`), jadi siapa pun yang membuka
-- DevTools bisa memakai key itu untuk:
--   - membaca SELURUH data customer (nama, nomor HP, kota, alamat), bukan
--     hanya pesanannya sendiri;
--   - membuat order palsu;
--   - mengubah order apa pun (current_status, tracking_number, nomor HP).
--
-- Komentar asli di 0013 bilang "for tracking page — we verify phone server-side".
-- Benar, verifikasi HP ada di aplikasi — tapi policy `USING (true)` tidak
-- memfilter apa pun, jadi RLS-nya sendiri tetap terbuka.
--
-- Pendekatan: aplikasi TIDAK LAGI mengandalkan RLS untuk otorisasi. Semua
-- akses server-side ke tabel ini sekarang memakai service role
-- (`createServiceClient()` di lib/supabase/server.ts), yang otorisasinya
-- diperiksa di route handler lewat `hasAdminAccess()` / `getAdminDb()`.
-- Halaman tracking publik juga service role, tapi diverifikasi nomor HP
-- (jersey) atau token HMAC (maklon) sebelum data dikembalikan.
--
-- PENTING: JANGAN tambahkan `FORCE ROW LEVEL SECURITY` pada tabel-tabel ini.
-- FORCE membuat RLS berlaku untuk pemilik tabel juga, sehingga service role
-- ikut terblokir dan seluruh dashboard berhenti.
--
-- Catatan urutan deploy: migrasi ini mengasumsikan kode yang memakai service
-- role sudah ter-deploy. Jalankan SETELAH deploy, bukan sebelumnya — kalau
-- dibalik, versi lama yang masih memakai anon key akan gagal baca/tulis.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
drop policy if exists "Public can view orders for tracking" on public.orders;
drop policy if exists "Public can create orders" on public.orders;
drop policy if exists "Public can update orders" on public.orders;

-- ---------------------------------------------------------------------------
-- order_status_history
-- ---------------------------------------------------------------------------
drop policy if exists "Public can view order status history" on public.order_status_history;
drop policy if exists "Public can create order status history" on public.order_status_history;
drop policy if exists "Public can update order status history" on public.order_status_history;

-- ---------------------------------------------------------------------------
-- maklon_orders (0024 — yang paling longgar, sampai DELETE terbuka)
-- ---------------------------------------------------------------------------
drop policy if exists "Public can view maklon orders" on public.maklon_orders;
drop policy if exists "Public can create maklon orders" on public.maklon_orders;
drop policy if exists "Public can update maklon orders" on public.maklon_orders;
drop policy if exists "Public can delete maklon orders" on public.maklon_orders;

-- ---------------------------------------------------------------------------
-- maklon_status_history
-- ---------------------------------------------------------------------------
drop policy if exists "Public can view maklon status history" on public.maklon_status_history;
drop policy if exists "Public can create maklon status history" on public.maklon_status_history;

-- ---------------------------------------------------------------------------
-- production_steps & maklon_steps
--
-- Policy tulisnya bernama "Admin write ..." tapi di 0015/0024 role-nya
-- `public` dengan `USING (true)`: siapa pun bisa MENGHAPUS dan MENULIS ULANG
-- daftar tahap produksi. Baca tetap publik (halaman /status butuh nama tahap),
-- tulis sekarang hanya lewat service role.
-- ---------------------------------------------------------------------------
drop policy if exists "Admin write production_steps" on public.production_steps;
drop policy if exists "Admin write maklon_steps" on public.maklon_steps;

-- ---------------------------------------------------------------------------
-- Verifikasi: setelah blok ini, tabel operasional tidak boleh punya policy
-- apa pun untuk role `public`/`anon`. Perintah di bawah akan menampilkan
-- daftar policy yang MASIH terbuka — hasilnya harus kosong.
-- ---------------------------------------------------------------------------
-- select tablename, policyname, cmd, roles::text
-- from pg_policies
-- where schemaname = 'public'
--   and tablename in ('orders', 'order_status_history',
--                     'maklon_orders', 'maklon_status_history')
-- order by tablename, cmd;
