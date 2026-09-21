import Image from "next/image";
import Link from "next/link";
import { getBrand } from "@/lib/queries";

export const dynamic = "force-dynamic";

/**
 * Halaman depan — belum ada landing page publik.
 * Isinya pintu masuk ke dua hal yang sudah jalan:
 * dashboard operasional (/pesanan) dan tracking customer (/track).
 */
export default async function HomePage() {
  const brand = await getBrand();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0c0c0d] px-5 py-16 text-white">
      <div className="pointer-events-none absolute -top-40 right-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,229,0,.18),transparent_70%)]" />
      <div className="relative w-full max-w-[420px] text-center">
        <Image
          src={brand.logoPath || "/logo-menara.png"}
          alt={brand.name}
          width={190}
          height={72}
          className="mx-auto h-auto w-[190px] object-contain"
          priority
        />
        <p className="mt-4 inline-block rounded-full border border-[rgba(255,229,0,.35)] bg-[rgba(255,229,0,.1)] px-3 py-[5px] text-[9.5px] font-bold uppercase tracking-[2.6px] text-[#ffe500]">
          Admin Panel
        </p>

        <h1 className="mt-7 text-[26px] font-bold leading-tight">
          Panel Operasional {brand.monogram ? brand.monogram : brand.name}
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-[#8a8a90]">
          Kelola pesanan, pantau tahap produksi, dan kirim update otomatis ke
          customer lewat WhatsApp.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/pesanan/orders"
            className="rounded-[10px] bg-[#ffe500] px-5 py-3 text-[13px] font-semibold text-[#111113] transition hover:brightness-95"
          >
            Masuk Dashboard Pesanan
          </Link>
          <Link
            href="/track"
            className="rounded-[10px] border border-[#26262a] bg-[#1b1b1e] px-5 py-3 text-[13px] font-semibold text-white transition hover:border-[#3a3a40]"
          >
            Lacak Pesanan Customer
          </Link>
        </div>

        <p className="mt-8 text-[11px] text-[#6e6e73]">
          {brand.tagline.split("\n")[0]}
        </p>
      </div>
    </main>
  );
}
