/**
 * Fallback content for the MENARA landing page.
 *
 * These values are used by lib/queries.ts when Supabase is unreachable
 * or returns no rows. Edit the live values from the admin panel once
 * the database is seeded — this file is the safety net, not the source
 * of truth at runtime.
 */
import {
  BagIcon,
  BoltIcon,
  FacebookIcon,
  FlameIcon,
  GiftIcon,
  GridIcon,
  InstagramIcon,
  MapsIcon,
  PaletteIcon,
  ShieldIcon,
  ShopeeIcon,
  StarIcon,
  TagIcon,
  TikTokIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { buildWhatsAppLink } from "@/lib/wa";
import type {
  Brand,
  CTALink,
  Fabric,
  Review,
  SocialLink,
  StatItem,
  TrustBadge,
} from "@/lib/types";

export const brand: Brand = {
  name: "MENARA",
  accentWord: "APPAREL",
  monogram: "MENARA",
  tagline: "Tempat Bikin Jersey Futsal Custom.\nDesain bebas, harga pabrik, kirim se-Indonesia.",
  url: "https://www.menara.id",
  description:
    "MENARA — tempat bikin jersey futsal custom full printing. Desain bebas, harga mulai 85rb, kirim se-Indonesia. Konsultasi gratis via WhatsApp.",
  // TODO: ganti dengan nomor WhatsApp resmi MENARA (juga di tabel `brand`).
  whatsappNumber: "6281234567890",
  logoPath: "/logo-menara.png",
  metaPixelId: "",
  metaPixelEnabled: false,
  flashSaleLink: "",
  flashSaleMessage: "Halo, saya mau order jersey (Flash Sale)",
};

export const trustBadges: TrustBadge[] = [
  { label: "Bahan Premium", subtext: "Kualitas terbaik", icon: ShieldIcon, variant: "success" },
  { label: "Desain Bebas", subtext: "Sesuai keinginanmu", icon: PaletteIcon, variant: "info" },
  { label: "Harga Pabrik", subtext: "Lebih hemat", icon: TagIcon, variant: "neutral" },
  { label: "Kirim Se-Indonesia", subtext: "Aman & terpercaya", icon: TruckIcon, variant: "success" },
];

export const stats: StatItem[] = [
  { value: "350K+", label: "Order Selesai", icon: BagIcon },
  { value: "4.9", label: "Rating", icon: StarIcon },
  { value: "100%", label: "Garansi", icon: ShieldIcon },
];

const waLink = buildWhatsAppLink(
  brand.whatsappNumber,
  "Halo MENARA, saya mau konsultasi soal jersey custom."
);

export const ctaLinks: CTALink[] = [
  {
    title: "Lihat Katalog & Harga Lengkap",
    description: "Pilihan model, bahan, dan harga terbaru",
    icon: GridIcon,
    accent: "primary",
    href: `${brand.url}/katalog`,
    external: true,
  },
  {
    title: "Chat WhatsApp",
    description: "Order & tanya desain langsung ke admin",
    icon: WhatsAppIcon,
    accent: "whatsapp",
    href: waLink,
    external: true,
  },
  {
    title: "PROMO BELI 6 GRATIS 1",
    description: "Berlaku kelipatannya — 12 dapat 14, dst",
    icon: GiftIcon,
    accent: "warning",
    href: waLink,
    external: true,
  },
  {
    title: "Order Sekarang",
    description: "Proses pemesanan cepat untuk jersey custom",
    icon: BoltIcon,
    accent: "neutral",
    href: waLink,
    external: true,
  },
  {
    title: "Promo Kemerdekaan",
    description: "Cek promo spesial kemerdekaan & penawaran terbaru bulan ini",
    icon: FlameIcon,
    accent: "danger",
    href: "/promo-bulan-ini",
    external: false,
  },
];

export const reviews: Review[] = [
  {
    rating: 5,
    quote:
      "Hasil printingnya rapi banget, warna sesuai desain. Anak tim langsung senang. Pasti repeat order!",
    name: "Dimas Pratama",
    location: "Jakarta",
    identity: "Kapten Tim Futsal",
  },
  {
    rating: 5,
    quote:
      "Harga pabrik beneran. Order 30 jersey buat komunitas, semua ukuran pas. Recommended pol.",
    name: "Rizky Maulana",
    location: "Surabaya",
    identity: "Koordinator Komunitas",
  },
  {
    rating: 5,
    quote:
      "CS-nya responsif, desain direvisi sampe cocok. Pengiriman cepat ke Bandung. Top.",
    name: "Andi Saputra",
    location: "Bandung",
    identity: "Tim Hockey Bandung",
  },
];

export const fabrics: Fabric[] = [
  {
    id: "jac-lightning",
    code: "JACQUARD",
    name: "LIGHTNING A",
    group: "jacquard",
    image: "/products/placeholder.svg",
    description: "Kain jacquard motif garis petir dengan tekstur anyaman timbul. Premium dan nyaman.",
  },
  {
    id: "jac-terraria",
    code: "JACQUARD",
    name: "TERRARIA A",
    group: "jacquard",
    image: "/products/placeholder.svg",
    description: "Motif jacquard terracotta earthy. Tekstur timbul, adem, cocok untuk jersey team event.",
  },
  {
    id: "jac-aurora",
    code: "JACQUARD",
    name: "AURORA A",
    group: "jacquard",
    image: "/products/placeholder.svg",
    description: "Jacquard dengan motif gradasi aurora. Tampil beda dan elegan di lapangan.",
  },
  {
    id: "base-airwalk",
    code: "DRIFIT",
    name: "AIRWALK A",
    group: "base",
    image: "/products/placeholder.svg",
    description: "Bahan dryfit ringan, menyerap keringat cepat, dan adem dipakai seharian.",
  },
  {
    id: "base-milano",
    code: "DRIFIT",
    name: "MILANO UV A",
    group: "base",
    image: "/products/placeholder.svg",
    description: "Dryfit milano dengan perlindungan UV, cocok untuk aktivitas outdoor dan harian.",
  },
  {
    id: "base-smash",
    code: "DRIFIT",
    name: "SMASH A",
    group: "base",
    image: "/products/placeholder.svg",
    description: "Dryfit smash dengan tekstur halus, ringan, dan tetap kering saat intense.",
  },
  {
    id: "emb-mix-a",
    code: "EMBOSSED",
    name: "MIX A",
    group: "embossed",
    image: "/products/placeholder.svg",
    description: "Kain emboss dengan kombinasi motif mix, efek timbul 3D yang premium.",
  },
  {
    id: "emb-mix-b",
    code: "EMBOSSED",
    name: "MIX B",
    group: "embossed",
    image: "/products/placeholder.svg",
    description: "Varian embossed mix B dengan komposisi motif berbeda, tetap eksklusif.",
  },
  {
    id: "emb-topo-a",
    code: "EMBOSSED",
    name: "TOPO A",
    group: "embossed",
    image: "/products/placeholder.svg",
    description: "Embossed motif topografi, tekstur timbul yang unik dan kekinian.",
  },
  {
    id: "emb-topo-b",
    code: "EMBOSSED",
    name: "TOPO B",
    group: "embossed",
    image: "/products/placeholder.svg",
    description: "Varian topo B dengan aksen motif lebih rapat dan detail.",
  },
];

export const socialLinks: SocialLink[] = [
  {
    label: "Shopee",
    icon: ShopeeIcon,
    href: "https://shopee.co.id/",
    ariaLabel: "MENARA di Shopee",
  },
  {
    label: "Instagram",
    icon: InstagramIcon,
    href: "https://instagram.com/menara",
    ariaLabel: "MENARA di Instagram",
  },
  {
    label: "TikTok",
    icon: TikTokIcon,
    href: "https://tiktok.com/@menara",
    ariaLabel: "MENARA di TikTok",
  },
  {
    label: "Facebook",
    icon: FacebookIcon,
    href: "https://facebook.com/menara",
    ariaLabel: "MENARA di Facebook",
  },
  {
    label: "Maps",
    icon: MapsIcon,
    href: "https://maps.google.com/?q=MENARA+SPORT",
    ariaLabel: "Lokasi MENARA di Google Maps",
  },
];
