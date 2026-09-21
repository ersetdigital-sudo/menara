-- ============================================================================
-- 0028_hapus_cta_link_mati.sql
--
-- Menghapus CTA di landing page yang mengarah ke domain mati.
--
-- Kenapa: dua CTA di-seed mengarah ke `https://www.menara.id/...`, sedangkan
-- domain itu sekarang balas 404 — termasuk halaman /katalog dan
-- /promo-bulan-ini yang memang tidak pernah ada di aplikasi ini. Jadi CTA-nya
-- tampil sebagai tombol di halaman depan, tapi tujuannya halaman kosong.
--
--   - "Lihat Katalog & Harga"  -> di-seed oleh 0002_brand_menara.sql
--   - "Promo Kemerdekaan"      -> di-seed oleh 0010_promo_bulan_ini_seed.sql
--
-- Dihapus lewat migrasi (bukan cuma UPDATE manual di database produksi) supaya
-- database yang dibangun ulang dari 0001 tidak memasukkan link mati itu lagi.
-- 0010 sendiri sudah punya `delete ... where title = 'Promo Kemerdekaan'` di
-- awalnya, tapi setelah blok ini jalan, 0010 akan meng-insert-nya kembali —
-- karena itu penghapusan ini diletakkan di migrasi paling akhir.
--
-- Kalau nanti situs katalog/promo-nya benar-benar live, tambahkan kembali
-- barisnya lewat menu CTA di dashboard, atau buat migrasi baru yang menunjuk
-- ke URL yang sudah pasti hidup.
-- ============================================================================

delete from public.cta_links
where href like '%menara.id%';

-- Sisa CTA setelah ini hanya yang mengarah ke WhatsApp.
-- VERIFIKASI (jalankan manual): harus tidak ada baris dengan href menara.id
--   select title, href from public.cta_links order by sort_order;
