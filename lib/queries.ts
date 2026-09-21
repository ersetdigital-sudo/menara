/**
 * Server-side data access — identitas toko.
 *
 * Aplikasi ini fokus ke dashboard operasional (pesanan, maklon, tracking).
 * Layer data untuk landing page/katalog sudah dibuang bersama tabelnya
 * (lihat migrasi 0029) — satu-satunya konten yang masih dibaca dari Supabase
 * adalah baris `brand`, yang dipakai halaman depan, metadata, dan halaman
 * tracking customer untuk nama toko + nomor WhatsApp CS.
 *
 * Fungsi ini mencoba Supabase dulu, lalu jatuh ke nilai statis di
 * lib/data.ts kalau database tidak terjangkau atau barisnya tidak ada —
 * supaya halaman publik tidak ikut mati saat database bermasalah.
 */
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import * as fallback from "@/lib/data";
import type { Brand, DbBrand } from "@/lib/types";

export async function getBrand(): Promise<Brand> {
  if (!supabaseConfigured()) return fallback.brand;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return fallback.brand;

  const row = data as DbBrand;
  return {
    name: row.name,
    monogram: row.monogram,
    tagline: row.tagline,
    description: row.description,
    whatsappNumber: row.whatsapp_number,
    logoPath: row.logo_path,
  };
}
