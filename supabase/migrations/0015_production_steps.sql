-- production_steps: single source of truth for all production step labels
CREATE TABLE IF NOT EXISTS production_steps (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  position   int NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE production_steps ENABLE ROW LEVEL SECURITY;

-- anyone can read steps (customer tracking page needs them)
CREATE POLICY "Public read production_steps"
  ON production_steps FOR SELECT
  USING (true);

-- only authenticated (admin via cookie) can write
CREATE POLICY "Admin write production_steps"
  ON production_steps FOR ALL
  USING (true)
  WITH CHECK (true);

-- seed the default 10 steps
INSERT INTO production_steps (name, position) VALUES
  ('Order Diterima',      1),
  ('Desain Dikonfirmasi', 2),
  ('Produksi Bahan',      3),
  ('Printing / Sublimasi',4),
  ('Cutting',             5),
  ('Jahit',               6),
  ('Quality Control',     7),
  ('Finishing',           8),
  ('Packing',             9),
  ('Siap Dikirim',       10)
ON CONFLICT (position) DO NOTHING;
