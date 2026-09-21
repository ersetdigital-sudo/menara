-- ============================================================================
-- MENARA — Promo Bulan Ini (bagian 1: enum)
-- ============================================================================
-- JALANKAN INI SEBAGAI QUERY TERPISAH (PERTAMA).
-- PostgreSQL melarang memakai nilai enum baru di transaksi yang sama dengan
-- ALTER TYPE, jadi penambahan enum dipisah dari INSERT seed (lih. 0010).
-- Idempotent: aman dijalankan ulang.
-- ============================================================================
do $$ begin
  alter type public.cta_accent add value if not exists 'danger';
exception when duplicate_object then null; end $$;