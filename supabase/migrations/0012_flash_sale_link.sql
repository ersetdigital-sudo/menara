-- Add Flash Sale link fields to brand table
ALTER TABLE public.brand
  ADD COLUMN IF NOT EXISTS flash_sale_link text DEFAULT '',
  ADD COLUMN IF NOT EXISTS flash_sale_message text DEFAULT 'Halo, saya mau order jersey (Flash Sale)';
