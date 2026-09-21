-- ============================================================
-- 0026: Perbaiki domain brand (menara.id -> www.menara.id)
-- ============================================================
-- brand.url diset ke 'https://menara.id' oleh 0002_brand_menara.sql, padahal
-- domain produksi adalah https://www.menara.id.
--
-- Dampaknya: /sitemap.xml dan /robots.txt di-generate dari brand.url, sehingga
-- sitemap yang ada di www.menara.id berisi 212 URL host menara.id.
-- Google menolak semuanya dengan error "URL tidak diperbolehkan untuk Peta
-- Situs di lokasi ini" (setiap URL di sitemap harus satu host dengan lokasi
-- file sitemap). Nilai yang sama juga jadi metadataBase + canonical di semua
-- halaman.
--
-- Idempotent: safe to re-run.

update public.brand set
  url        = 'https://www.menara.id',
  updated_at = now()
where id = 1;

-- CTA links ikut menyimpan domain lama.
update public.cta_links
set href = replace(href, '//menara.id', '//www.menara.id')
where href like '%//menara.id%';
