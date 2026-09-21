/**
 * Server-side data access for the order tracking system.
 *
 * Public functions verify customer_phone before returning data.
 * Admin functions require authenticated Supabase client.
 *
 * Semua query di berkas ini memakai SERVICE ROLE client, karena `orders` /
 * `order_status_history` tidak lagi membuka policy ke anon (lihat migrasi
 * 0001_baseline_schema.sql).
 * Otorisasi ada di pemanggilnya: halaman tracking memverifikasi nomor HP,
 * sedangkan endpoint dashboard memakai getAdminDb().
 *
 * Pembuatan nomor pesanan ada di lib/order-number.ts — itu bukan query, dan
 * dipakai bersama oleh pesanan jersey dan maklon.
 */
import { createServiceClient } from "@/lib/supabase/server";
import type { Order, OrderStatus, OrderStatusHistory } from "@/lib/types";

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
