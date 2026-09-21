/**
 * Icon name registry + brand color mapping + metadata.
 *
 * Maps the string key stored in the database (e.g. "WhatsAppIcon") to
 * the React component, and exposes the official brand color per social
 * platform so SocialLinkIcon can render each in its real brand color.
 *
 * ICON_METADATA provides Indonesian labels + categories for the admin
 * icon picker dropdown. The internal key stays English for backward
 * compatibility with existing DB data.
 */
import type { ComponentType, SVGProps } from "react";
import * as icons from "@/components/icons";

export type IconName = keyof typeof icons;

export const ICON_NAMES = Object.keys(icons) as IconName[];

export function resolveIcon(
  name: string | null | undefined
): ComponentType<SVGProps<SVGSVGElement>> | undefined {
  if (!name) return undefined;
  return (icons as Record<string, ComponentType<SVGProps<SVGSVGElement>>>)[name];
}

/* ---- Icon metadata for admin picker ---- */

export interface IconMeta {
  key: string;
  label: string;
  category: string;
}

const CATEGORIES = [
  "Belanja & Order",
  "Komunikasi",
  "Keunggulan & Trust",
  "Pengiriman & Proses",
  "Produksi & Custom",
  "Promo & Marketing",
  "Sosial & Brand",
  "Umum",
] as const;

export const ICON_METADATA: IconMeta[] = [
  // Belanja & Order
  { key: "CartIcon", label: "Keranjang", category: "Belanja & Order" },
  { key: "BagIcon", label: "Tas Belanja", category: "Belanja & Order" },
  { key: "CatalogIcon", label: "Katalog", category: "Belanja & Order" },
  { key: "GridIcon", label: "Grid / Katalog", category: "Belanja & Order" },
  { key: "ListIcon", label: "Daftar Produk", category: "Belanja & Order" },

  // Komunikasi
  { key: "WhatsAppIcon", label: "WhatsApp", category: "Komunikasi" },
  { key: "ChatIcon", label: "Chat / Pesan", category: "Komunikasi" },
  { key: "PhoneIcon", label: "Telepon", category: "Komunikasi" },
  { key: "EmailIcon", label: "Email", category: "Komunikasi" },
  { key: "HeadsetIcon", label: "Customer Service", category: "Komunikasi" },

  // Keunggulan & Trust
  { key: "CheckIcon", label: "Centang", category: "Keunggulan & Trust" },
  { key: "StarIcon", label: "Bintang", category: "Keunggulan & Trust" },
  { key: "ShieldIcon", label: "Perisai / Garansi", category: "Keunggulan & Trust" },
  { key: "VerifiedBadgeIcon", label: "Terverifikasi", category: "Keunggulan & Trust" },
  { key: "HeartIcon", label: "Favorit / Cinta", category: "Keunggulan & Trust" },
  { key: "CrownIcon", label: "Premium / Juara", category: "Keunggulan & Trust" },
  { key: "SparklesIcon", label: "Kilau / Premium", category: "Keunggulan & Trust" },

  // Pengiriman & Proses
  { key: "TruckIcon", label: "Truk / Pengiriman", category: "Pengiriman & Proses" },
  { key: "TruckFastIcon", label: "Pengiriman Kilat", category: "Pengiriman & Proses" },
  { key: "PackageIcon", label: "Paket / Box", category: "Pengiriman & Proses" },
  { key: "PinIcon", label: "Lokasi", category: "Pengiriman & Proses" },
  { key: "ClockIcon", label: "Jam / Waktu", category: "Pengiriman & Proses" },
  { key: "BoltIcon", label: "Kilat / Cepat", category: "Pengiriman & Proses" },

  // Produksi & Custom
  { key: "JerseyIcon", label: "Jersey / Kaos", category: "Produksi & Custom" },
  { key: "FactoryIcon", label: "Pabrik", category: "Produksi & Custom" },
  { key: "PaletteIcon", label: "Desain / Palet", category: "Produksi & Custom" },
  { key: "PrinterIcon", label: "Printing / Cetak", category: "Produksi & Custom" },
  { key: "ScissorsIcon", label: "Potong / Jahit", category: "Produksi & Custom" },
  { key: "RulerIcon", label: "Ukuran", category: "Produksi & Custom" },
  { key: "LayersIcon", label: "Lapisan / Layer", category: "Produksi & Custom" },

  // Promo & Marketing
  { key: "FlameIcon", label: "Api / Promo Panas", category: "Promo & Marketing" },
  { key: "TagIcon", label: "Label / Harga", category: "Promo & Marketing" },
  { key: "PercentIcon", label: "Diskon / Persen", category: "Promo & Marketing" },
  { key: "GiftIcon", label: "Hadiah", category: "Promo & Marketing" },
  { key: "MegaphoneIcon", label: "Pengumuman", category: "Promo & Marketing" },

  // Sosial & Brand
  { key: "InstagramIcon", label: "Instagram", category: "Sosial & Brand" },
  { key: "TikTokIcon", label: "TikTok", category: "Sosial & Brand" },
  { key: "FacebookIcon", label: "Facebook", category: "Sosial & Brand" },
  { key: "ShopeeIcon", label: "Shopee", category: "Sosial & Brand" },
  { key: "MapsIcon", label: "Google Maps", category: "Sosial & Brand" },
  { key: "GlobeIcon", label: "Website", category: "Sosial & Brand" },

  // Umum
  { key: "ArrowRightIcon", label: "Panah Kanan", category: "Umum" },
  { key: "ChevronRightIcon", label: "Chevron Kanan", category: "Umum" },
  { key: "InfoIcon", label: "Info", category: "Umum" },
  { key: "UsersIcon", label: "Tim / Pelanggan", category: "Umum" },
  { key: "SunIcon", label: "Matahari", category: "Umum" },
  { key: "MoonIcon", label: "Bulan", category: "Umum" },
  { key: "LogoutIcon", label: "Keluar", category: "Umum" },
];

/** Get label for an icon key (falls back to the key itself). */
export function iconLabel(key: string): string {
  return ICON_METADATA.find((m) => m.key === key)?.label ?? key;
}

/** Grouped metadata for the picker dropdown, ordered by category. */
export function groupedIcons(): { category: string; items: IconMeta[] }[] {
  const map = new Map<string, IconMeta[]>();
  for (const meta of ICON_METADATA) {
    if (!map.has(meta.category)) map.set(meta.category, []);
    map.get(meta.category)!.push(meta);
  }
  return CATEGORIES
    .filter((cat) => map.has(cat))
    .map((cat) => ({ category: cat, items: map.get(cat)! }));
}

/**
 * Official brand color per social platform.
 *
 * Instagram uses an inline gradient (handled in the icon itself), so it
 * returns `undefined` here — the tile background stays neutral so the
 * gradient icon reads cleanly.
 */
export const SOCIAL_BRAND_COLORS: Record<string, string | undefined> = {
  WhatsAppIcon: "#25D366",
  ShopeeIcon: "#EE4D2D",
  InstagramIcon: undefined, // inline gradient in the icon
  TikTokIcon: "#000000",
  FacebookIcon: "#1877F2",
  MapsIcon: "#4285F4",
};

/** Background tint (10% opacity) for the social icon tile. */
export function brandTileColor(iconName: string): string | undefined {
  const c = SOCIAL_BRAND_COLORS[iconName];
  if (!c) return undefined;
  return `${c}1A`; // append alpha = 0x1A ≈ 10%
}
