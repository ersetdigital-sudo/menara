-- ============================================================
-- 0020: RPC SECURITY DEFINER untuk operasi DB notifikasi Fonnte
-- ============================================================
-- Latar belakang: endpoint dashboard Pesanan (/api/pesanan/*) berjalan
-- dengan anon key (tanpa session Supabase), sedangkan notification_logs
-- dan app_settings ber-RLS authenticated-only. Supaya alur notifikasi
-- bisa jalan dari sana TANPA membuka tabel ke publik, operasi DB-nya
-- dibungkus RPC SECURITY DEFINER (izin lewat fungsi, bukan lewat tabel).

-- 1. Klaim slot notifikasi: insert log status 'pending', anti-duplikat
--    lewat unique (order_id, stage). Return NULL bila sudah pernah ada
--    (race condition aman — ini kuncinya).
CREATE OR REPLACE FUNCTION public.claim_stage_notification(
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
  IF p_stage NOT BETWEEN 1 AND 11 THEN
    RAISE EXCEPTION 'stage must be between 1 and 11';
  END IF;

  INSERT INTO notification_logs (order_id, stage, status)
  VALUES (p_order_id, p_stage, 'pending')
  RETURNING id INTO v_id;

  RETURN v_id;
EXCEPTION WHEN unique_violation THEN
  RETURN NULL;
END;
$$;

-- 2. Selesaikan log: set status success/failed + response_payload.
CREATE OR REPLACE FUNCTION public.finish_stage_notification(
  p_id uuid,
  p_status text,
  p_response jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE notification_logs
  SET status = p_status,
      response_payload = p_response
  WHERE id = p_id;
$$;

-- 3. Tandai tahap terakhir yang notifikasinya sukses terkirim.
CREATE OR REPLACE FUNCTION public.mark_last_notified_stage(
  p_order_id uuid,
  p_stage integer
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE orders
  SET last_notified_stage = p_stage
  WHERE id = p_order_id;
$$;

-- 4. Baca nilai app_settings (tetap ciphertext — didekripsi server-side).
CREATE OR REPLACE FUNCTION public.get_app_setting_value(p_key text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT value FROM app_settings WHERE key = p_key;
$$;

-- 5. Tulis app_settings — HANYA key fonnte_token yang diizinkan, dan nilai
--    yang masuk selalu ciphertext (dienkripsi server-side sebelum dipanggil).
CREATE OR REPLACE FUNCTION public.set_app_setting(p_key text, p_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_key <> 'fonnte_token' THEN
    RAISE EXCEPTION 'key not allowed';
  END IF;

  INSERT INTO app_settings (key, value, updated_at)
  VALUES (p_key, p_value, now())
  ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value,
        updated_at = now();
END;
$$;

-- Executable oleh siapa pun yang memegang anon key — aman karena fungsi
-- hanya melakukan operasi sempit di atas (validasi stage/key + nilai ciphertext).
GRANT EXECUTE ON FUNCTION public.claim_stage_notification(uuid, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finish_stage_notification(uuid, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_last_notified_stage(uuid, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_setting_value(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_app_setting(text, text) TO anon, authenticated;