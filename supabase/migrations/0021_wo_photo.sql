-- ============================================================
-- Work Order photo (admin-only, not exposed to customer)
-- ============================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS wo_photos JSONB DEFAULT '[]'::jsonb;
