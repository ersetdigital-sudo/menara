import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTokenFromCookie } from "@/lib/verify-token";
import { loadStatusInitial } from "@/lib/status-server";
import StatusClient from "./StatusClient";

export const metadata: Metadata = {
  title: "Status Pesanan",
  description: "Pantau progres produksi pesanan jersey custom MENARA.",
};

// Dibaca per request: token ada di query/cookie, jadi halaman ini tidak bisa
// di-cache sebagai halaman statis.
export const dynamic = "force-dynamic";

/**
 * Identitas toko tidak lagi dibaca di sini — halaman status sekarang murni
 * tracking tanpa tombol WhatsApp, jadi tidak ada lagi nomor yang perlu
 * dipasok ke halaman ini.
 *
 * Token diambil dari link WhatsApp (`?token=`) dulu; cookie perangkat jadi
 * cadangan supaya kunjungan ulang (bookmark/refresh tanpa query) tetap bisa
 * dirender di server — dulu halaman ini kosong beberapa detik karena isinya
 * baru diambil browser lewat dua request berurutan. Kalau dua-duanya tidak ada,
 * halaman dirender seperti sebelumnya dan klien menampilkan modal verifikasi HP.
 */
export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; token?: string }>;
}) {
  const sp = await searchParams;
  const h = await headers();
  const token = sp.token || getTokenFromCookie(h.get("cookie"));
  const initial = await loadStatusInitial(sp.order, token);

  return (
    <Suspense fallback={null}>
      <StatusClient initial={initial} />
    </Suspense>
  );
}
