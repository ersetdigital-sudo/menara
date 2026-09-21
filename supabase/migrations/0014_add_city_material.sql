-- Add missing columns for the admin dashboard
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_city TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS material TEXT DEFAULT '';
