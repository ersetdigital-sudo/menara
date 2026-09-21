import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cek akses admin untuk route handler.
 *
 * Menerima dua sumber auth (keduanya dicek SERVER-SIDE):
 * - cookie `pesanan_auth=true` — dashboard Pesanan (`/pesanan/orders`,
 *   login pakai shared password via /api/pesanan/auth).
 * - user Supabase authenticated — dashboard admin (`/admin`).
 */
export async function hasAdminAccess(
  supabase: SupabaseClient
): Promise<boolean> {
  const cookieStore = await cookies();
  if (cookieStore.get("pesanan_auth")?.value === "true") return true;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(user);
}