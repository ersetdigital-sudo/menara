-- ============================================================
-- Design preview photos per size row (Cloudinary URLs)
-- ============================================================

-- Add design_photos column to orders (JSON array: [{size, url}])
ALTER TABLE orders ADD COLUMN IF NOT EXISTS design_photos JSONB DEFAULT '[]'::jsonb;
