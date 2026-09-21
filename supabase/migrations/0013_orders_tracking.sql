-- ============================================================
-- Orders Tracking System
-- ============================================================

-- Drop existing objects if they exist (safe for re-run)
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

-- Enum for order statuses
CREATE TYPE order_status AS ENUM (
  'order_diterima',
  'desain_dikonfirmasi',
  'produksi_bahan',
  'printing_sublimasi',
  'cutting',
  'jahit',
  'quality_control',
  'finishing',
  'packing',
  'siap_dikirim'
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'jersey',
  quantity INTEGER NOT NULL DEFAULT 1,
  sizes TEXT NOT NULL DEFAULT '',
  custom_name TEXT NOT NULL DEFAULT '',
  custom_number TEXT NOT NULL DEFAULT '',
  design_notes TEXT DEFAULT '',
  current_status order_status NOT NULL DEFAULT 'order_diterima',
  tracking_number TEXT DEFAULT '',
  courier TEXT DEFAULT '',
  delay_reason TEXT DEFAULT '',
  delay_estimated_date TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order status history table
CREATE TABLE order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  note TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_current_status ON orders(current_status);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Public can read orders (for tracking page — we verify phone server-side)
CREATE POLICY "Public can view orders for tracking" ON orders
  FOR SELECT USING (true);

-- Public can read status history
CREATE POLICY "Public can view order status history" ON order_status_history
  FOR SELECT USING (true);

-- Public can create orders (auth handled by API cookie in /pesanan)
CREATE POLICY "Public can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Public can create order status history
CREATE POLICY "Public can create order status history" ON order_status_history
  FOR INSERT WITH CHECK (true);

-- Public can update orders (for status updates via /pesanan)
CREATE POLICY "Public can update orders" ON orders
  FOR UPDATE USING (true);

-- Public can update order status history
CREATE POLICY "Public can update order status history" ON order_status_history
  FOR UPDATE USING (true);

-- Authenticated users (admin) can do everything
CREATE POLICY "Admin can manage orders" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage order status history" ON order_status_history
  FOR ALL USING (auth.role() = 'authenticated');
