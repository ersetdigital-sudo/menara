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
import {
  createClient,
  createServiceClient,
  serviceRoleConfigured,
  supabaseConfigured,
} from "@/lib/supabase/server";
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

/**
 * Jam operasional toko dari `app_settings` (kunci `jam_operasional`), dengan
 * cadangan lib/data.ts kalau belum diisi atau database tidak terjangkau.
 *
 * Dipakai halaman publik (beranda & tracking) supaya teksnya ikut berubah saat
 * admin mengubahnya di menu Pengaturan — dulu jam ini ditulis langsung di
 * halaman tracking, jadi nilai di database dan yang tampil bisa berbeda.
 *
 * Kenapa service role: policy RLS `app_settings` sengaja tidak dibuka untuk
 * anon — tabel yang sama juga menyimpan token Fonnte (walau terenkripsi),
 * sehingga tabelnya tidak boleh dibaca publik. Yang dibaca di sini cuma satu
 * kunci, dan hasilnya memang untuk ditampilkan.
 */
export async function getOperationalHours(): Promise<string> {
  if (!serviceRoleConfigured()) return fallback.JAM_OPERASIONAL;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "jam_operasional")
    .maybeSingle();

  if (error || !data?.value?.trim()) return fallback.JAM_OPERASIONAL;
  return data.value;
}
