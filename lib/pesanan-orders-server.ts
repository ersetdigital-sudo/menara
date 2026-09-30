/**
 * Pembacaan data pesanan jersey untuk DASHBOARD ADMIN (server-only).
 *
 * Dipakai dua jalur:
 *   1. GET /api/pesanan/orders — dipanggil browser setelah halaman terbuka
 *      (refresh berkala, setelah simpan, dsb).
 *   2. app/pesanan/orders/page.tsx — dibaca saat render server, supaya kartu
 *      KPI dan tabel sudah berisi data di HTML pertama, bukan menunggu fetch
 *      dari browser dulu.
 *
 * Karena itu pemetaan baris → bentuk yang dipakai dashboard ada di SINI, bukan
 * di route handler: dua jalur itu wajib mengirim bentuk data yang identik.
 * Kalau berbeda, kartu bisa berkedip berubah setelah fetch pertama selesai.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isOrderCompleted,
  progressPercentFromStatus,
  stepFromStatus,
} from "@/lib/order-status";

/** Satu baris tabel `orders` → bentuk yang dipakai dashboard. */
export function mapOrder(row: any) {
  const hasTracking = !!(row.tracking_number && row.courier);
  const step = stepFromStatus(row.current_status);
  const pct = progressPercentFromStatus(row.current_status, hasTracking);
  return {
    id: row.order_number,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    customer_city: row.customer_city || "",
    product_name: row.product_type || "",
    quantity: row.quantity ? `${row.quantity} pcs` : "-",
    material: row.material || "",
    sizes: row.sizes || "",
    design_photos: Array.isArray(row.design_photos) ? row.design_photos.map((p: any) =>
      typeof p === "string" ? p : p.url || ""
    ).filter(Boolean) : [],
    wo_photos: Array.isArray(row.wo_photos) ? row.wo_photos.map((p: any) => typeof p === "string" ? p : p.url || "").filter(Boolean) : [],
    products: Array.isArray(row.products) ? row.products : [],
    current_step: step,
    note: row.design_notes || "",
    note_time: row.updated_at || "",
    courier: row.courier || "",
    tracking_number: row.tracking_number || "",
    is_done: isOrderCompleted(row.current_status) || (step === 11 && hasTracking),
    deadline: row.deadline || null,
    created_at: row.created_at,
    pct,
  };
}

/** Bentuk satu order persis seperti yang dipakai dashboard (turunan `mapOrder`). */
export type DashboardOrder = ReturnType<typeof mapOrder>;

/**
 * Seluruh pesanan, terbaru dulu.
 * Gagal baca dilempar sebagai Error supaya pemanggil memutuskan sendiri:
 * route handler membalas 500, halaman merender dengan daftar kosong.
 */
export async function loadDashboardOrders(supabase: SupabaseClient): Promise<DashboardOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map(mapOrder);
}
