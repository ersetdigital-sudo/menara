-- Table: katalog_testimonials (customer testimonials for katalog page)
CREATE TABLE IF NOT EXISTS public.katalog_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  team text NOT NULL,
  quote text NOT NULL,
  image_url text,
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  badge text DEFAULT 'Verified Buyer',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.katalog_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read katalog_testimonials" ON public.katalog_testimonials FOR SELECT USING (true);
CREATE POLICY "Authenticated insert katalog_testimonials" ON public.katalog_testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update katalog_testimonials" ON public.katalog_testimonials FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete katalog_testimonials" ON public.katalog_testimonials FOR DELETE TO authenticated USING (true);

-- Seed data
INSERT INTO public.katalog_testimonials (name, city, team, quote, rating, badge, sort_order) VALUES
  ('Rizky Pratama', 'Jakarta Selatan', 'Tim Futsal Kantor BCA', 'Order 24 pcs jersey futsal buat tim kantor, semua puas banget. Bahan dryfit-nya adem, jahitan rapi, dan yang paling penting—desainnya persis kayak yang kami mau. Harga segini dapat kualitas segini, worth it banget sih.', 5, 'Verified Buyer', 1),
  ('Dewi Lestari', 'Bandung', 'Komunitas Lari ITB', 'Buat event lari 5K kampus, kami pesan 300 pcs jersey running. Hasilnya rapi, bahan ringan, dan selesai tepat waktu padahal deadline-nya mepet. Peserta pada nanya beli di mana, langsung repeat order deh.', 5, 'Verified Buyer', 2),
  ('Ahmad Fauzan', 'Surabaya', 'Tim Voli SMA Negeri 3', 'Udah 4 kali order jersey voli di sini. Yang bikin loyal: desainnya selalu fresh, revisi gratis sampai cocok, dan CS-nya fast response banget. Kali ini 50 pcs selesai 5 hari, top!', 5, 'Verified Buyer', 3),
  ('Siti Nurhaliza', 'Yogyakarta', 'Klub Badminton UGM', 'Pesan 12 set jersey badminton buat klub, dari desain sampai pengiriman cuma seminggu. Jahitannya kuat, printing-nya tajam, dan celananya juga nyaman dipake. Pasti bakal order lagi buat turnamen bulan depan.', 5, 'Verified Buyer', 4),
  ('Budi Santoso', 'Malang', 'Komunitas Cyclist Malang', 'Komunitas cyclist kami pesan 80 pcs jersey sepeda. Bahan breathable, nggak gerah pasgowes jarak jauh. Desainnya juga kece, banyak yang nanya custom di mana. MENARA jawabannya!', 5, 'Verified Buyer', 5),
  ('Hendra Wijaya', 'Semarang', 'SMA Muhammadiyah 2', 'Pesan jersey sekolah buat 200 anak. Harga pabrik emang beda jauh dari vendor lain. Kualitas jahitan oke, printing full color nggak luntur setelah dicuci berkali-kali. Anak-anak seneng banget pakainya.', 5, 'Verified Buyer', 6);
