/**
 * Nilai fallback untuk identitas toko.
 *
 * Dipakai lib/queries.ts saat Supabase tidak terjangkau atau baris `brand`
 * tidak ada. Isi sebenarnya dikelola dari dashboard (menu Pengaturan) —
 * berkas ini cuma jaring pengaman supaya halaman depan dan halaman tracking
 * tetap tampil, bukan sumber kebenaran saat runtime.
 *
 * TODO: ganti `whatsappNumber` di sini DAN di tabel `brand` dengan nomor
 * resmi MENARA. Nilainya masih placeholder.
 */
import type { Brand } from "@/lib/types";

export const brand: Brand = {
  name: "MENARA",
  monogram: "MENARA",
  tagline:
    "Tempat Bikin Jersey Futsal Custom.\nDesain bebas, harga pabrik, kirim se-Indonesia.",
  description:
    "MENARA — tempat bikin jersey futsal custom full printing. Desain bebas, harga mulai 85rb, kirim se-Indonesia. Konsultasi gratis via WhatsApp.",
  whatsappNumber: "6281234567890",
  logoPath: "/logo-menara.png",
};
