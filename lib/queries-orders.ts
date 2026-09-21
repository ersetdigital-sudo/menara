/**
 * Server-side data access for the order tracking system.
 *
 * Public functions verify customer_phone before returning data.
 * Admin functions require authenticated Supabase client.
 *
 * Semua query di berkas ini memakai SERVICE ROLE client, karena policy anon
 * pada `orders` / `order_status_history` sudah ditutup (migrasi 0027).
 * Otorisasi ada di pemanggilnya: halaman tracking memverifikasi nomor HP,
 * sedangkan endpoint dashboard memakai hasAdminAccess().
 */
import { randomBytes as _randomBytes } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import type { Order, OrderStatus, OrderStatusHistory } from "@/lib/types";

const crypto = { randomBytes: _randomBytes };

// ---------------------------------------------------------------------------
// Public — Customer tracking
// ---------------------------------------------------------------------------

/**
 * Verify and fetch an order by order_number + customer_phone.
 * Returns null if not found or phone doesn't match.
 */
export async function getOrderByTracking(
  orderNumber: string,
  phone: string
): Promise<{ order: Order; history: OrderStatusHistory[] } | null> {
  const supabase = createServiceClient();

  const normalizedPhone = phone.replace(/\D/g, "");

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber.toUpperCase())
    .maybeSingle();

  if (error || !order) return null;

  const orderPhone = (order.customer_phone as string).replace(/\D/g, "");
  if (orderPhone !== normalizedPhone) return null;

  const { data: history } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  const { wo_photos: _wo, ...safeOrder } = order as any;
  return {
    order: safeOrder as Order,
    history: (history ?? []) as OrderStatusHistory[],
  };
}

// ---------------------------------------------------------------------------
// Helpers: strip admin-only fields before exposing to customer
// ---------------------------------------------------------------------------

export function stripWoPhoto(order: any): any {
  if (!order || typeof order !== "object") return order;
  const { wo_photos, ...rest } = order;
  return rest;
}

// ---------------------------------------------------------------------------
// Admin — Order management
// ---------------------------------------------------------------------------

/** Fetch all orders (admin only). */
export async function getAllOrders(): Promise<Order[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Order[];
}

/** Fetch a single order by ID (admin only). */
export async function getOrderById(
  id: string
): Promise<{ order: Order; history: OrderStatusHistory[] } | null> {
  const supabase = createServiceClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !order) return null;

  const { data: history } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  return {
    order: order as Order,
    history: (history ?? []) as OrderStatusHistory[],
  };
}
 
// Ambiguous chars removed: B/I/O/L/0/1 (sering salah ketik pelanggan)
const ORDER_CHARSET = "ACDEFGHJKMNPQRSTUVWXYZ23456789";
export const ORDER_NUMBER_REGEX = /^(MENARA\d{6}[ACDEFGHJKMNPQRSTUVWXYZ23456789]{4}|MENARA-\d{6}-\d{3})$/;

/** Random 4-char code from safe charset using CSPRNG. */
function randomCode(): string {
  const bytes = crypto.randomBytes(4);
  let code = "";
  for (let i = 0; i < 4; i++) code += ORDER_CHARSET[bytes[i] % ORDER_CHARSET.length];
  return code;
}

/** Get YYMMDD in Asia/Jakarta timezone. */
function jakartaDatePart(date = new Date()): string {
  const jkt = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const yy = String(jkt.getFullYear()).slice(-2);
  const mm = String(jkt.getMonth() + 1).padStart(2, "0");
  const dd = String(jkt.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/**
 * Generate order number (new format): MNRYYMMDDXXXX
 * e.g. MENARA260907K4XQ — 13 chars, CSPRNG, charset aman.
 * Unique check against DB; retry max 5x on collision.
 */
export async function generateOrderNumber(): Promise<string> {
  const supabase = createServiceClient();
  const datePart = jakartaDatePart();

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `MENARA${datePart}${randomCode()}`;

    const { data } = await supabase
      .from("orders")
      .select("order_number")
      .eq("order_number", candidate)
      .maybeSingle();

    if (!data) return candidate;
  }

  throw new Error("Gagal generate nomor order unik, coba lagi");
}
