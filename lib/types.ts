/**
 * Type definitions for all landing-page + catalog content.
 *
 * Two layers exist on purpose:
 *
 * 1. `Db*` types — the raw row shape returned by Supabase. `icon` is a
 *    string key (e.g. "WhatsAppIcon") stored in the database.
 * 2. UI types (Brand, StatItem, CTALink, …) — what components consume,
 *    where `icon` is a resolved React component.
 *
 * lib/queries.ts bridges the two: it fetches `Db*` rows and maps the
 * icon string to the matching component from components/icons.
 *
 * Keeping DB-shape and UI-shape separate means the database is never
 * aware of React, and components are never aware of string keys.
 */
import type { ComponentType, SVGProps } from "react";

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------
export interface Brand {
  name: string;
  accentWord: string;
  monogram: string;
  tagline: string;
  url: string;
  description: string;
  whatsappNumber: string;
  logoPath: string;
  metaPixelId: string;
  metaPixelEnabled: boolean;
  flashSaleLink: string;
  flashSaleMessage: string;
}

export interface DbBrand extends Omit<Brand, "whatsappNumber" | "logoPath" | "accentWord" | "metaPixelId" | "metaPixelEnabled" | "flashSaleLink" | "flashSaleMessage"> {
  accent_word: string;
  whatsapp_number: string;
  logo_path: string;
  meta_pixel_id: string;
  meta_pixel_enabled: boolean;
  flash_sale_link: string;
  flash_sale_message: string;
}

// ---------------------------------------------------------------------------
// Landing content
// ---------------------------------------------------------------------------
export interface TrustBadge {
  label: string;
  subtext?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  variant: "neutral" | "filled" | "success" | "warning" | "info";
}

export interface DbTrustBadge {
  id: string;
  label: string;
  subtext: string | null;
  icon: string | null;
  variant: "neutral" | "filled" | "success" | "warning" | "info";
  sort_order: number;
}

export interface StatItem {
  value: string;
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

export type CTAAccent = "whatsapp" | "primary" | "warning" | "neutral" | "danger";

export interface CTALink {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  accent: CTAAccent;
  href?: string;
  external?: boolean;
}

export interface Review {
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  name: string;
  location: string;
  /** Short identity descriptor, e.g. "Kapten Tim Futsal". */
  identity?: string;
}

export interface SocialLink {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href: string;
  ariaLabel: string;
}

/** DB-row shape shared by stats / cta_links / social_links (icon stored as string). */
export interface DbStat {
  value: string;
  label: string;
  icon: string | null;
  sort_order: number;
}

export interface DbCTALink {
  title: string;
  description: string;
  href: string | null;
  accent: CTAAccent;
  icon: string | null;
  sort_order: number;
}

export interface DbReview {
  rating: number;
  quote: string;
  name: string;
  location: string;
  identity?: string;
  sort_order: number;
}

export interface DbSocialLink {
  label: string;
  href: string;
  icon: string;
  aria_label: string;
  sort_order: number;
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------
export type StockStatus = "in_stock" | "limited" | "out_of_stock";
export type ProductSize = "S" | "M" | "L" | "XL" | "XXL";

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  size: ProductSize;
  stockQty: number;
  priceDelta: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string | null;
  stockStatus: StockStatus;
  featured: boolean;
  sortOrder: number;
  images: ProductImage[];
  variants: ProductVariant[];
}

// ---------------------------------------------------------------------------
// Admin payload types (for create/update forms)
// ---------------------------------------------------------------------------
export interface ProductPayload {
  slug: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string | null;
  stockStatus: StockStatus;
  featured: boolean;
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// Fabrics (bahan kain)
// ---------------------------------------------------------------------------
export type FabricGroupId = "jacquard" | "base" | "embossed";

export interface Fabric {
  id: string;
  code: string;
  name: string;
  group: FabricGroupId;
  image: string;
  description: string | null;
}

export interface DbFabric {
  id: string;
  code: string;
  name: string;
  fabric_group: FabricGroupId;
  image_url: string | null;
  description: string | null;
  sort_order: number;
}

// ---------------------------------------------------------------------------
// Orders Tracking — 9 production steps
// ---------------------------------------------------------------------------
export type OrderStatus =
  | "desain"
  | "layout"
  | "profing_warna"
  | "cetak_print"
  | "press_transfer"
  | "potong_pola"
  | "jahit"
  | "finishing"
  | "quality_control"
  | "packing"
  | "kirim"
  | "selesai";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  desain: "Desain",
  layout: "Layout",
  profing_warna: "Profing Warna",
  cetak_print: "Cetak / Print",
  press_transfer: "Press / Transfer Sublime",
  potong_pola: "Potong Pola / Cutting Panel",
  jahit: "Jahit / Sewing",
  finishing: "Finishing",
  quality_control: "Quality Control",
  packing: "Packing",
  kirim: "Kirim",
  selesai: "Selesai",
};

export const ORDER_STATUS_LIST: OrderStatus[] = [
  "desain",
  "layout",
  "profing_warna",
  "cetak_print",
  "press_transfer",
  "potong_pola",
  "jahit",
  "finishing",
  "quality_control",
  "packing",
  "kirim",
];

/** Fixed progress percentage for each step (1-indexed) */
export const STEP_PROGRESS: Record<number, number> = {
  1: 9,
  2: 18,
  3: 27,
  4: 36,
  5: 45,
  6: 55,
  7: 64,
  8: 73,
  9: 82,
  10: 91,
  11: 100,
};

export function getProgress(step: number, hasTracking: boolean): number {
  if (step === 11 && hasTracking) return 100;
  return STEP_PROGRESS[step] ?? 0;
}

export const ORDER_PHOTO_STAGES: OrderStatus[] = [
  "desain",
  "potong_pola",
  "finishing",
  "packing",
];

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  product_type: string;
  quantity: number;
  sizes: string;
  custom_name: string;
  custom_number: string;
  design_notes: string;
  current_status: OrderStatus;
  /** Nomor tahap produksi aktif (1-9), lihat lib/fonnte.ts STAGE_NAMES. */
  current_stage?: number | null;
  /** Tahap terakhir yang notifikasi WA-nya berhasil terkirim. */
  last_notified_stage?: number | null;
  tracking_number: string;
  courier: string;
  deadline: string | null;
  /** Admin-only: Work Order photo URLs (never exposed to customer) */
  wo_photos?: string[];
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string;
  photo_url: string;
  created_at: string;
}
