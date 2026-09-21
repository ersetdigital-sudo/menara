/**
 * Nilai fallback untuk identitas toko.
 *
 * Dipakai lib/queries.ts saat Supabase tidak terjangkau atau baris `brand`
 * tidak ada. Isi sebenarnya dikelola dari dashboard (menu Pengaturan) —
 * berkas ini cuma jaring pengaman supaya halaman depan dan halaman tracking
 * tetap tampil, bukan sumber kebenaran saat runtime.
 */
import type { Brand } from "@/lib/types";

/**
 * Nomor WhatsApp resmi MENARA — satu-satunya tempat nomor cadangan ditulis.
 *
 * Dipakai halaman tracking & pesan WhatsApp saat nilai dari tabel `brand`
 * belum/tidak terbaca (database tidak terjangkau). Nomor yang tampil saat
 * normal tetap dari tabel `brand` (menu Pengaturan admin) lewat `getBrand()
 * di lib/queries.ts, jadi mengganti nomor tidak perlu deploy.
 */
export const WA_NUMBER = "628115491117";

export const brand: Brand = {
  name: "MENARA",
  monogram: "MENARA",
  tagline:
    "Tempat Bikin Jersey Futsal Custom.\nDesain bebas, harga pabrik, kirim se-Indonesia.",
  description:
    "MENARA — tempat bikin jersey futsal custom full printing. Desain bebas, harga mulai 85rb, kirim se-Indonesia. Konsultasi gratis via WhatsApp.",
  whatsappNumber: WA_NUMBER,
  logoPath: "/logo-menara.png",
};
