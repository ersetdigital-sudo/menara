import { Suspense } from "react";
import type { Metadata } from "next";
import StatusClient from "./StatusClient";

export const metadata: Metadata = {
  title: "Status Pesanan",
  description: "Pantau progres produksi pesanan jersey custom MENARA.",
};

// Identitas toko tidak lagi dibaca di sini — halaman status sekarang murni
// tracking tanpa tombol WhatsApp, jadi tidak ada lagi nomor yang perlu
// dipasok ke halaman ini.
export const dynamic = "force-dynamic";

export default async function StatusPage() {
  return (
    <Suspense fallback={null}>
      <StatusClient />
    </Suspense>
  );
}
