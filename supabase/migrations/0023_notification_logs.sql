-- 0023_notification_logs.sql
-- Tabel riwayat pengiriman notifikasi deadline

DROP TABLE IF EXISTS notification_logs;

CREATE TABLE notification_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid REFERENCES orders(id) ON DELETE SET NULL,
  order_number text,
  phone       text NOT NULL,
  status      text NOT NULL DEFAULT 'sent',
  error       text,
  diff_days   int,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage notification_logs" ON notification_logs;
CREATE POLICY "Admin manage notification_logs" ON notification_logs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_notification_logs_created ON notification_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_order ON notification_logs (order_id);
