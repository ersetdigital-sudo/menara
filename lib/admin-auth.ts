import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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

/**
 * Guard standar untuk route handler dashboard.
 *
 * Mengembalikan service-role client bila request terautentikasi, atau `null`
 * bila tidak — pemanggil tinggal membalas 401.
 *
 * Kenapa service role: policy anon pada tabel operasional (orders,
 * order_status_history, maklon_orders, maklon_status_history) sudah ditutup
 * di migrasi 0027, jadi satu-satunya jalur ke tabel itu adalah service role.
 * Otorisasi TIDAK boleh lagi diandalkan dari RLS — karena itu cek admin
 * dilakukan di sini, sekali, sebelum query apa pun dijalankan.
 *
 *   const db = await getAdminDb();
 *   if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 */
export async function getAdminDb(): Promise<SupabaseClient | null> {
  const authClient = await createClient();
  if (!(await hasAdminAccess(authClient))) return null;
  return createServiceClient();
}