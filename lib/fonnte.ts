/**
 * Integrasi notifikasi WhatsApp via Fonnte API.
 *
 * - Satu fungsi template untuk SEMUA tahap (bukan 9 template terpisah).
 * - Token diambil dari tabel `app_settings`, didekripsi SERVER-SIDE
 *   (lib/fonnte-crypto), dan TIDAK PERNAH dikirim ke client/browser.
 * - Nomor HP dinormalisasi + divalidasi sebelum dikirim (lihat lib/wa.ts).
 */

import { normalizeWhatsAppNumber } from "@/lib/wa";
import { decryptSecret } from "@/lib/fonnte-crypto";
import { createClient } from "@/lib/supabase/server";
import { signTrackingToken } from "@/lib/verify-token";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAppUrl } from "@/lib/app-url";

export const FONNTE_TOKEN_KEY = "fonnte_token";
export const FONNTE_API_URL = "https://api.fonnte.com/send";
export const FONNTE_TIMEOUT_MS = 10_000;

/** Nama tahap produksi (1-11). */
export const STAGE_NAMES: Record<number, string> = {
  1: "Desain",
  2: "Layout",
  3: "Profing Warna",
  4: "Cetak / Print",
  5: "Press / Transfer Sublime",
  6: "Potong Pola / Cutting Panel",
  7: "Jahit / Sewing",
  8: "Finishing",
  9: "Quality Control",
  10: "Packing",
  11: "Kirim",
};

/** Map status text (kolom current_status) → nomor tahap 1-11. */
export const STATUS_TO_STAGE: Record<string, number> = {
  desain: 1,
  layout: 2,
  profing_warna: 3,
  cetak_print: 4,
  press_transfer: 5,
  potong_pola: 6,
  jahit: 7,
  finishing: 8,
  quality_control: 9,
  packing: 10,
  kirim: 11,
};

/** Map nomor tahap 1-11 → status text (kebalikan STATUS_TO_STAGE). */
export const STAGE_TO_STATUS: Record<number, string> = Object.fromEntries(
  Object.entries(STATUS_TO_STAGE).map(([status, stage]) => [stage, status])
);

/**
 * URL tracking publik (encode nomor pesanan bila ada karakter spesial).
 * Token opsional (HMAC 30 hari) membuat customer bisa langsung lihat
 * progres TANPA verifikasi HP — lihat app/status/page.tsx.
 */
export function buildTrackingUrl(orderNumber: string, token?: string): string {
  const base = `${getAppUrl()}/status?order=${encodeURIComponent(orderNumber)}`;
  return token ? `${base}&token=${encodeURIComponent(token)}` : base;
}

/**
 * URL tracking publik khusus pesanan MAKLON.
 * Halaman /status sendiri cuma mengenal tabel `orders` (jersey), jadi maklon
 * punya halaman + token sendiri di /status/maklon.
 */
export function buildMaklonTrackingUrl(orderNumber: string, token?: string): string {
  const base = `${getAppUrl()}/status/maklon?order=${encodeURIComponent(orderNumber)}`;
  return token ? `${base}&token=${encodeURIComponent(token)}` : base;
}

/**
 * Satu fungsi template untuk semua tahap.
 * - Tahap 1-10: template umum "UPDATE PESANAN".
 * - Tahap 11: template khusus "PESANAN DIKIRIM".
 * Tanpa emoji, bahasa Indonesia natural, hanya tahap aktif (tanpa daftar 11 tahap).
 */
export function buildWhatsAppMessage(
  stage: number,
  order: { customer_name: string; order_number: string },
  token?: string
): string {
  const customerName = order.customer_name;
  const orderNumber = order.order_number;
  const trackingUrl = buildTrackingUrl(orderNumber, token);

  if (stage === 11) {
    return [
      "PESANAN DIKIRIM",
      `Halo Kak ${customerName},`,
      "",
      `Pesanan #${orderNumber} sudah selesai diproduksi dan sudah masuk tahap pengiriman.`,
      "",
      "Cek detail pesanan dan informasi pengiriman di:",
      trackingUrl,
      "",
      "Terima kasih sudah mempercayakan pesanan Kakak kepada MENARA.",
    ].join("\n");
  }

  const stageName = STAGE_NAMES[stage] ?? `Tahap ${stage}`;

    return [
      "UPDATE PESANAN",
      `Halo Kak ${customerName},`,
      "",
      `Pesanan #${orderNumber} saat ini sudah masuk tahap:`,
      `*${stageName}*`,
      "",
      `Progress: ${stage}/11 tahap`,
      "",
      "Cek progres lengkap pesanan Kakak di:",
      trackingUrl,
      "",
      "Kami akan mengirimkan update kembali saat pesanan masuk ke tahap berikutnya.",
      "",
      "Terima kasih sudah mempercayakan pesanan Kakak kepada MENARA.",
    ].join("\n");
}

/** Nama tahap produksi Maklon (1-6). */
export const MAKLON_STAGE_NAMES: Record<number, string> = {
  1: "Layout",
  2: "Profing Warna",
  3: "Cutting Bahan",
  4: "Press Sublime",
  5: "QC",
  6: "Kirim",
};

/**
 * Template WhatsApp untuk update tahap Maklon (1-6).
 * Tahap 6 (Kirim) memakai template khusus; lainnya template umum.
 */
export function buildMaklonWhatsAppMessage(
  stage: number,
  order: { customer_name: string; order_number: string },
  token?: string
): string {
  const customerName = order.customer_name;
  const orderNumber = order.order_number;
  const trackingUrl = buildMaklonTrackingUrl(orderNumber, token);

  if (stage === 6) {
    return [
      "MAKLON DIKIRIM",
      `Halo Kak ${customerName},`,
      "",
      `Pesanan maklon #${orderNumber} sudah selesai diproduksi dan masuk tahap pengiriman.`,
      "",
      "Cek detail pesanan di:",
      trackingUrl,
      "",
      "Terima kasih sudah mempercayakan pesanan Kakak kepada MENARA.",
    ].join("\n");
  }

  const stageName = MAKLON_STAGE_NAMES[stage] ?? `Tahap ${stage}`;

  return [
    "UPDATE MAKLON",
    `Halo Kak ${customerName},`,
    "",
    `Pesanan maklon #${orderNumber} saat ini sudah masuk tahap:`,
    `*${stageName}*`,
    "",
    `Progress: ${stage}/6 tahap`,
    "",
    "Cek progres lengkap di:",
    trackingUrl,
    "",
    "Kami akan mengirimkan update kembali saat pesanan masuk ke tahap berikutnya.",
    "",
    "Terima kasih sudah mempercayakan pesanan Kakak kepada MENARA.",
  ].join("\n");
}

/** Validasi nomor HP format internasional Fonnte (628xxxxxxxxxx). */
export function isValidFonntePhone(phone: string): boolean {
  return /^62\d{8,14}$/.test(phone);
}

/**
 * Ambil token Fonnte dari app_settings, didekripsi server-side.
 * Return null bila belum disimpan. TIDAK pernah di-log.
 */
export async function getFonnteToken(): Promise<string | null> {
  const supabase = await createClient();
  // Lewat RPC SECURITY DEFINER supaya jalan juga dari endpoint anon
  // (dashboard Pesanan). Nilai tetap ciphertext — didekripsi di sini.
  const { data } = await supabase.rpc("get_app_setting_value", {
    p_key: FONNTE_TOKEN_KEY,
  });

  if (!data) return null;

  try {
    return decryptSecret(String(data));
  } catch {
    // Key berubah / data korup — tidak di-log isinya, cukup return null.
    return null;
  }
}

/**
 * Kirim pesan WhatsApp via Fonnte API.
 * - Token diambil + didekripsi di server, dipakai sebagai header Authorization.
 * - Timeout 10 detik, error network ditangani try-catch.
 * - Return `{ success, response }` — response TIDAK pernah berisi token.
 */
export async function sendFonnteMessage(
  phone: string,
  message: string
): Promise<{ success: boolean; response: Record<string, unknown> }> {
  const token = await getFonnteToken();
  if (!token) {
    return {
      success: false,
      response: { error: "fonnte_token_not_set" },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FONNTE_TIMEOUT_MS);

  try {
    const res = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ target: phone, message }),
      signal: controller.signal,
    });

    let body: Record<string, unknown> = {};
    try {
      body = (await res.json()) as Record<string, unknown>;
    } catch {
      // Response bukan JSON — pakai status code saja.
      body = { status_code: res.status };
    }

    return {
      success: res.ok,
      response: { status_code: res.status, ...body },
    };
  } catch (err) {
    // AbortController → timeout; fetch error lain → network failure.
    const name = err instanceof Error ? err.name : "unknown";
    return {
      success: false,
      response: { error: name === "AbortError" ? "timeout" : "network_error" },
    };
  } finally {
    clearTimeout(timeout);
  }
}

/** Normalisasi + validasi satu paket untuk dipakai endpoint admin. */
export function normalizeAndValidatePhone(raw: string): string | null {
  const phone = normalizeWhatsAppNumber(raw);
  return isValidFonntePhone(phone) ? phone : null;
}

/** Hasil trigger notifikasi untuk response API. */
export type NotificationTriggerStatus =
  | "sent"
  | "failed"
  | "skipped_duplicate"
  | "log_error";

/**
 * Trigger satu pengiriman notifikasi WA — dipakai endpoint admin
 * (`/api/admin/orders/[id]/status`) dan dashboard Pesanan
 * (`/api/pesanan/orders/[id]/status`).
 *
 * 1. INSERT notification_logs (order_id, stage) — unique constraint di DB
 *    = anti-duplikat, aman walau ada race condition/request kembar.
 * 2. Insert sukses → build pesan → kirim Fonnte → update log
 *    (success/failed + response_payload) → update last_notified_stage
 *    HANYA jika sukses.
 *
 * Seluruh proses dibungkus try-catch: kegagalan kirim WA TIDAK pernah
 * dilempar ke atas (status order tetap tersimpan).
 */
export async function triggerMaklonStageNotification(
  supabase: SupabaseClient,
  orderId: string,
  order: {
    customer_name: string;
    order_number: string;
    customer_phone: string;
  },
  stage: number
): Promise<NotificationTriggerStatus> {
  const { data: logId, error: claimError } = await supabase.rpc(
    "claim_maklon_stage_notification",
    { p_order_id: orderId, p_stage: stage }
  );

  if (claimError) {
    console.error("claim_maklon_stage_notification failed:", claimError.message);
    return "log_error";
  }
  if (!logId) return "skipped_duplicate";

  try {
    const phone = normalizeAndValidatePhone(order.customer_phone);
    if (!phone) {
      await supabase.rpc("finish_maklon_stage_notification", {
        p_id: logId,
        p_status: "failed",
        p_response: { error: "invalid_phone" },
      });
      return "failed";
    }

    const message = buildMaklonWhatsAppMessage(
      stage,
      order,
      signTrackingToken(order.order_number)
    );
    const result = await sendFonnteMessage(phone, message);

    await supabase.rpc("finish_maklon_stage_notification", {
      p_id: logId,
      p_status: result.success ? "success" : "failed",
      p_response: result.response,
    });

    if (!result.success) return "failed";

    await supabase.rpc("mark_maklon_last_notified_stage", {
      p_order_id: orderId,
      p_stage: stage,
    });

    return "sent";
  } catch (err) {
    console.error(
      "Maklon WA notification failed:",
      err instanceof Error ? err.message : err
    );
    try {
      await supabase.rpc("finish_maklon_stage_notification", {
        p_id: logId,
        p_status: "failed",
        p_response: { error: "unexpected" },
      });
    } catch {
      // log adalah best effort
    }
    return "failed";
  }
}

export async function triggerStageNotification(
  supabase: SupabaseClient,
  orderId: string,
  order: {
    customer_name: string;
    order_number: string;
    customer_phone: string;
  },
  stage: number
): Promise<NotificationTriggerStatus> {
  // 1. Klaim slot lewat RPC SECURITY DEFINER (anti-duplikat di level DB,
  //    aman dari race condition). Return NULL = sudah pernah terkirim.
  const { data: logId, error: claimError } = await supabase.rpc(
    "claim_stage_notification",
    { p_order_id: orderId, p_stage: stage }
  );

  if (claimError) {
    // Error DB lain — catat tanpa menggagalkan update status.
    console.error("claim_stage_notification failed:", claimError.message);
    return "log_error";
  }
  if (!logId) return "skipped_duplicate";

  try {
    const phone = normalizeAndValidatePhone(order.customer_phone);
    if (!phone) {
      await supabase.rpc("finish_stage_notification", {
        p_id: logId,
        p_status: "failed",
        p_response: { error: "invalid_phone" },
      });
      return "failed";
    }

    const message = buildWhatsAppMessage(
      stage,
      order,
      signTrackingToken(order.order_number)
    );
    const result = await sendFonnteMessage(phone, message);

    // Update status log (response_payload TIDAK pernah berisi token).
    await supabase.rpc("finish_stage_notification", {
      p_id: logId,
      p_status: result.success ? "success" : "failed",
      p_response: result.response,
    });

    if (!result.success) return "failed";

    // last_notified_stage hanya di-update kalau kirim sukses.
    await supabase.rpc("mark_last_notified_stage", {
      p_order_id: orderId,
      p_stage: stage,
    });

    return "sent";
  } catch (err) {
    // Kegagalan WA → status order tetap tersimpan, cukup log error.
    console.error(
      "WA notification failed:",
      err instanceof Error ? err.message : err
    );
    try {
      await supabase.rpc("finish_stage_notification", {
        p_id: logId,
        p_status: "failed",
        p_response: { error: "unexpected" },
      });
    } catch {
      // log adalah best effort
    }
    return "failed";
  }
}