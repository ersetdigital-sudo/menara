-- ============================================================
-- Structured products per order (multi-product support)
-- ============================================================

-- products: [{name, sizes: [{size, qty}]}]
ALTER TABLE orders ADD COLUMN IF NOT EXISTS products JSONB DEFAULT '[]'::jsonb;
