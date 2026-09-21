-- ============================================================
-- 0025: Notifikasi WhatsApp (Fonnte) untuk pesanan Maklon
-- ============================================================
-- Tabel log terpisah dari notification_logs (yang FK-nya ke orders),
-- plus RPC SECURITY DEFINER agar bisa dipanggil dari endpoint anon.

CREATE TABLE IF NOT EXISTS maklon_notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES maklon_orders(id) ON DELETE CASCADE,
  stage integer NOT NULL,
  sent_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  response_payload jsonb,
  CONSTRAINT maklon_notification_logs_order_stage_unique UNIQUE (order_id, stage),
  CONSTRAINT maklon_notification_logs_stage_range CHECK (stage BETWEEN 1 AND 6),
  CONSTRAINT maklon_notification_logs_status_check CHECK (status IN ('pending', 'success', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_maklon_notification_logs_order_id ON maklon_notification_logs(order_id);

ALTER TABLE maklon_notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage maklon_notification_logs" ON maklon_notification_logs
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE maklon_orders ADD COLUMN IF NOT EXISTS last_notified_stage integer;

CREATE OR REPLACE FUNCTION public.claim_maklon_stage_notification(
  p_order_id uuid,
  p_stage integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  IF p_stage NOT BETWEEN 1 AND 6 THEN
    RAISE EXCEPTION 'stage must be between 1 and 6';
  END IF;

  INSERT INTO maklon_notification_logs (order_id, stage, status)
  VALUES (p_order_id, p_stage, 'pending')
  RETURNING id INTO v_id;

  RETURN v_id;
EXCEPTION WHEN unique_violation THEN
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.finish_maklon_stage_notification(
  p_id uuid,
  p_status text,
  p_response jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE maklon_notification_logs
  SET status = p_status,
      response_payload = p_response
  WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.mark_maklon_last_notified_stage(
  p_order_id uuid,
  p_stage integer
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE maklon_orders
  SET last_notified_stage = p_stage
  WHERE id = p_order_id;
$$;

GRANT EXECUTE ON FUNCTION public.claim_maklon_stage_notification(uuid, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finish_maklon_stage_notification(uuid, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_maklon_last_notified_stage(uuid, integer) TO anon, authenticated;