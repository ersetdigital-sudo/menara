-- ============================================================
-- 0019: Fonnte WhatsApp notifications (order stage updates)
-- ============================================================
-- Adds:
--   orders.current_stage        int (1-9) — tahap produksi aktif
--   orders.last_notified_stage  int (nullable) — tahap terakhir yang WA-nya sudah terkirim
--   notification_logs           tabel log kirim (unique order_id + stage = anti-duplikat)
--   app_settings                key-value untuk config terenkripsi (fonnte_token)
-- ============================================================

-- 1. Orders — kolom tahap produksi
ALTER TABLE orders ADD COLUMN IF NOT EXISTS current_stage integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_notified_stage integer;

-- Backfill current_stage dari current_status (migration 0016 memakai nama text)
UPDATE orders SET current_stage = 1 WHERE current_stage IS NULL AND current_status = 'desain';
UPDATE orders SET current_stage = 2 WHERE current_stage IS NULL AND current_status = 'layout';
UPDATE orders SET current_stage = 3 WHERE current_stage IS NULL AND current_status = 'print';
UPDATE orders SET current_stage = 4 WHERE current_stage IS NULL AND current_status = 'pres';
UPDATE orders SET current_stage = 5 WHERE current_stage IS NULL AND current_status = 'potong';
UPDATE orders SET current_stage = 6 WHERE current_stage IS NULL AND current_status = 'jahit';
UPDATE orders SET current_stage = 7 WHERE current_stage IS NULL AND current_status = 'finishing';
UPDATE orders SET current_stage = 8 WHERE current_stage IS NULL AND current_status = 'packing';
UPDATE orders SET current_stage = 9 WHERE current_stage IS NULL AND current_status IN ('kirim', 'selesai');

-- 2. notification_logs — kunci anti-duplikat DI DATABASE (bukan hanya di kode),
--    aman walau ada race condition / request kembar
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stage integer NOT NULL,
  sent_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  response_payload jsonb,
  CONSTRAINT notification_logs_order_stage_unique UNIQUE (order_id, stage),
  CONSTRAINT notification_logs_stage_range CHECK (stage BETWEEN 1 AND 9),
  CONSTRAINT notification_logs_status_check CHECK (status IN ('pending', 'success', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_order_id ON notification_logs(order_id);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Hanya admin (authenticated) yang boleh baca/tulis log notifikasi
CREATE POLICY "Admin manage notification_logs" ON notification_logs
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. app_settings — config admin (nilai disimpan terenkripsi AES-256-GCM di sisi server)
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Hanya admin (authenticated) yang boleh akses app_settings
CREATE POLICY "Admin manage app_settings" ON app_settings
  FOR ALL USING (auth.role() = 'authenticated');