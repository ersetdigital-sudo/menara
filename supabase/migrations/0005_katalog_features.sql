-- Table: katalog_features (editable feature cards for "Kenapa MENARA?" section)
CREATE TABLE IF NOT EXISTS public.katalog_features (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section     text NOT NULL CHECK (section IN ('feature', 'info')),
  icon        text,
  title       text NOT NULL,
  description text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS katalog_features_section_idx ON public.katalog_features(section);

-- RLS
ALTER TABLE public.katalog_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read katalog_features"
  ON public.katalog_features FOR SELECT
  USING (true);

CREATE POLICY "Authenticated insert katalog_features"
  ON public.katalog_features FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update katalog_features"
  ON public.katalog_features FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated delete katalog_features"
  ON public.katalog_features FOR DELETE
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER touch_katalog_features_updated_at
  BEFORE UPDATE ON public.katalog_features
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed data: Feature cards
INSERT INTO public.katalog_features (section, icon, title, description, sort_order) VALUES
  ('feature', 'Thermometer', 'Adem & Nyaman', 'Bahan ringan, menyerap keringat, dan nyaman untuk aktivitas fisik intens.', 1),
  ('feature', 'Palette', 'Free Custom Design', 'Tim desainer siap mewujudkan ide jersey dengan revisi tanpa batas.', 2),
  ('feature', 'Scissors', 'Jahitan Kuat & Rapi', 'Dijahit presisi dengan mesin modern agar awet untuk jangka panjang.', 3),
  ('feature', 'Clock', 'Cepat & Tepat', 'Proses produksi terjadwal, cocok bahkan untuk turnamen mendadak.', 4);

-- Seed data: Info cards
INSERT INTO public.katalog_features (section, icon, title, description, sort_order) VALUES
  ('info', 'Cog', 'Mesin teknologi tinggi', 'Hasil print konsisten dan presisi.', 1),
  ('info', 'Droplets', 'Tinta bersertifikat', 'Tajam, cerah, dan tidak mudah pudar.', 2),
  ('info', 'Headphones', 'Pelayanan profesional', 'Didampingi dari konsultasi sampai kirim.', 3);
