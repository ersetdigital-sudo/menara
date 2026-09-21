-- ============================================================================
-- MENARA — 0003 baseline seed
-- ============================================================================
-- Bagian dari baseline (hasil squash migrasi 0001–0029). Jalankan SETELAH 0002.
-- Isinya disalin dari baris yang benar-benar ada di database produksi saat
-- squash dibuat, jadi tidak ada tebakan.
--
-- Aman dijalankan ulang (upsert / on conflict). TIDAK ada rahasia di sini —
-- token Fonnte disimpan lewat dashboard (`/api/admin/settings/fonnte`) dalam
-- bentuk ciphertext, bukan di file migrasi.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Identitas toko (satu baris, id = 1)
-- ----------------------------------------------------------------------------
insert into public.brand (id, name, monogram, tagline, description, whatsapp_number, logo_path)
values (
  1,
  'MENARA',
  'MENARA',
  E'Pabrik Jersey Custom Full Printing.\nDesain bebas, harga pabrik, kirim se-Indonesia.',
  'MENARA — pabrik jersey custom full printing. Desain bebas, harga mulai 85rb, kirim se-Indonesia. Konsultasi gratis via WhatsApp.',
  '6281234567890',
  '/logo-menara.png'
)
on conflict (id) do update set
  name            = excluded.name,
  monogram        = excluded.monogram,
  tagline         = excluded.tagline,
  description     = excluded.description,
  whatsapp_number = excluded.whatsapp_number,
  logo_path       = excluded.logo_path;

-- ----------------------------------------------------------------------------
-- Nama tahap pesanan jersey (9 baris) — dipakai halaman /status
-- ----------------------------------------------------------------------------
insert into public.production_steps (name, position) values
  ('Desain',    1),
  ('Layout',    2),
  ('Print',     3),
  ('Pres',      4),
  ('Potong',    5),
  ('Jahit',     6),
  ('Finishing', 7),
  ('Packing',   8),
  ('Kirim',     9)
on conflict (position) do update set name = excluded.name;

-- ----------------------------------------------------------------------------
-- Nama tahap maklon (6 baris) — dipakai halaman /status/maklon
-- ----------------------------------------------------------------------------
insert into public.maklon_steps (name, position) values
  ('Layout',        1),
  ('Profing Warna', 2),
  ('Cutting Bahan', 3),
  ('Press Sublime', 4),
  ('QC',            5),
  ('Kirim',         6)
on conflict (position) do update set name = excluded.name;
