-- 0016: Replace 10 production steps with 9 new steps
-- + add deadline column to orders
-- + migrate existing order statuses to new step names
-- + drop the enum constraint (use text for flexibility)

-- 1. Delete old steps and insert new 9
DELETE FROM production_steps;

INSERT INTO production_steps (name, position) VALUES
  ('Desain',    1),
  ('Layout',    2),
  ('Print',     3),
  ('Pres',      4),
  ('Potong',    5),
  ('Jahit',     6),
  ('Finishing', 7),
  ('Packing',   8),
  ('Kirim',     9);

-- 2. Add deadline column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deadline timestamptz;

-- 3. Drop default, convert enum columns to text, drop enum
ALTER TABLE orders ALTER COLUMN current_status DROP DEFAULT;
ALTER TABLE orders ALTER COLUMN current_status TYPE text;
ALTER TABLE order_status_history ALTER COLUMN status TYPE text;
DROP TYPE IF EXISTS order_status;

-- 4. Migrate existing order statuses to new step names
UPDATE orders SET current_status = 'desain'    WHERE current_status IN ('order_diterima', 'desain_dikonfirmasi');
UPDATE orders SET current_status = 'print'     WHERE current_status IN ('produksi_bahan', 'printing_sublimasi', 'printing');
UPDATE orders SET current_status = 'potong'    WHERE current_status = 'cutting';
UPDATE orders SET current_status = 'finishing' WHERE current_status = 'quality_control';
UPDATE orders SET current_status = 'kirim'     WHERE current_status = 'siap_dikirim';

UPDATE order_status_history SET status = 'desain'    WHERE status IN ('order_diterima', 'desain_dikonfirmasi');
UPDATE order_status_history SET status = 'print'     WHERE status IN ('produksi_bahan', 'printing_sublimasi', 'printing');
UPDATE order_status_history SET status = 'potong'    WHERE status = 'cutting';
UPDATE order_status_history SET status = 'finishing' WHERE status = 'quality_control';
UPDATE order_status_history SET status = 'kirim'     WHERE status = 'siap_dikirim';
