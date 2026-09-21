-- Table: fabrics (bahan kain options for katalog page)
CREATE TABLE IF NOT EXISTS public.fabrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  fabric_group text NOT NULL DEFAULT 'base' CHECK (fabric_group IN ('jacquard', 'base', 'embossed')),
  image_url text,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.fabrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read fabrics" ON public.fabrics FOR SELECT USING (true);
CREATE POLICY "Authenticated insert fabrics" ON public.fabrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update fabrics" ON public.fabrics FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete fabrics" ON public.fabrics FOR DELETE TO authenticated USING (true);

-- Seed data
INSERT INTO public.fabrics (code, name, fabric_group, description, sort_order) VALUES
  ('JACQUARD', 'LIGHTNING A', 'jacquard', 'Kain jacquard motif garis petir dengan tekstur anyaman timbul. Premium dan nyaman.', 1),
  ('JACQUARD', 'TERRARIA A', 'jacquard', 'Motif jacquard terracotta earthy. Tekstur timbul, adem, cocok untuk jersey team event.', 2),
  ('JACQUARD', 'AURORA A', 'jacquard', 'Jacquard dengan motif gradasi aurora. Tampil beda dan elegan di lapangan.', 3),
  ('DRIFIT', 'AIRWALK A', 'base', 'Bahan dryfit ringan, menyerap keringat cepat, dan adem dipakai seharian.', 4),
  ('DRIFIT', 'MILANO UV A', 'base', 'Dryfit milano dengan perlindungan UV, cocok untuk aktivitas outdoor dan harian.', 5),
  ('DRIFIT', 'SMASH A', 'base', 'Dryfit smash dengan tekstur halus, ringan, dan tetap kering saat intense.', 6),
  ('EMBOSSED', 'MIX A', 'embossed', 'Kain emboss dengan kombinasi motif mix, efek timbul 3D yang premium.', 7),
  ('EMBOSSED', 'MIX B', 'embossed', 'Varian embossed mix B dengan komposisi motif berbeda, tetap eksklusif.', 8),
  ('EMBOSSED', 'TOPO A', 'embossed', 'Embossed motif topografi, tekstur timbul yang unik dan kekinian.', 9),
  ('EMBOSSED', 'TOPO B', 'embossed', 'Varian topo B dengan aksen motif lebih rapat dan detail.', 10);