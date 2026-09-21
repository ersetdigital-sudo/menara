-- 0024: Maklon orders — separate table from jersey orders.
-- 6 production steps: Layout, Profing Warna, Cutting Bahan, Press Sublime, QC, Kirim.

CREATE TABLE IF NOT EXISTS maklon_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_city TEXT DEFAULT '',
  product_type TEXT NOT NULL DEFAULT '',
  material TEXT DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  sizes TEXT NOT NULL DEFAULT '',
  design_notes TEXT DEFAULT '',
  current_status TEXT NOT NULL DEFAULT 'layout',
  current_stage INTEGER NOT NULL DEFAULT 1,
  design_photos JSONB DEFAULT '[]'::jsonb,
  wo_photos JSONB DEFAULT '[]'::jsonb,
  products JSONB DEFAULT '[]'::jsonb,
  tracking_number TEXT DEFAULT '',
  courier TEXT DEFAULT '',
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maklon_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES maklon_orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maklon_orders_order_number ON maklon_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_maklon_orders_customer_phone ON maklon_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_maklon_orders_current_status ON maklon_orders(current_status);
CREATE INDEX IF NOT EXISTS idx_maklon_status_history_order_id ON maklon_status_history(order_id);

ALTER TABLE maklon_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE maklon_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view maklon orders" ON maklon_orders
  FOR SELECT USING (true);
CREATE POLICY "Public can create maklon orders" ON maklon_orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update maklon orders" ON maklon_orders
  FOR UPDATE USING (true);
CREATE POLICY "Public can delete maklon orders" ON maklon_orders
  FOR DELETE USING (true);

CREATE POLICY "Public can view maklon status history" ON maklon_status_history
  FOR SELECT USING (true);
CREATE POLICY "Public can create maklon status history" ON maklon_status_history
  FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS maklon_steps (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  position   int NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE maklon_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read maklon_steps" ON maklon_steps FOR SELECT USING (true);
CREATE POLICY "Admin write maklon_steps" ON maklon_steps FOR ALL USING (true) WITH CHECK (true);

INSERT INTO maklon_steps (name, position) VALUES
  ('Layout',        1),
  ('Profing Warna', 2),
  ('Cutting Bahan', 3),
  ('Press Sublime', 4),
  ('QC',            5),
  ('Kirim',         6)
ON CONFLICT (position) DO NOTHING;