-- Add Meta Pixel fields to brand table
ALTER TABLE public.brand
  ADD COLUMN IF NOT EXISTS meta_pixel_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS meta_pixel_enabled boolean DEFAULT false;
