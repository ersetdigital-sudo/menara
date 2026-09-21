/**
 * Server-side data access for the public site.
 *
 * Every function here:
 *   1. Tries Supabase first (using the server client — auth cookies flow
 *      through automatically).
 *   2. Falls back to the static defaults in lib/data.ts when Supabase is
 *      unreachable OR returns no rows. This keeps the landing page
 *      resilient — a misconfigured database never takes the site down.
 *
 * All functions are safe to call from Server Components and run at
 * request/build time (ISR controls re-frequency).
 */
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { resolveIcon } from "@/lib/icon-registry";
import { cloudinaryUrl } from "@/lib/cloudinary";
import * as fallback from "@/lib/data";
import type {
  Brand,
  CTALink,
  DbBrand,
  DbCTALink,
  DbFabric,
  DbReview,
  DbSocialLink,
  DbStat,
  DbTrustBadge,
  Fabric,
  FabricGroupId,
  Review,
  SocialLink,
  StatItem,
  TrustBadge,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------
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
    accentWord: row.accent_word,
    monogram: row.monogram,
    tagline: row.tagline,
    url: row.url,
    description: row.description,
    whatsappNumber: row.whatsapp_number,
    logoPath: row.logo_path,
    metaPixelId: row.meta_pixel_id ?? "",
    metaPixelEnabled: row.meta_pixel_enabled ?? false,
    flashSaleLink: row.flash_sale_link ?? "",
    flashSaleMessage: row.flash_sale_message ?? "Halo, saya mau order jersey (Flash Sale)",
  };
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------
export async function getStats(): Promise<StatItem[]> {
  if (!supabaseConfigured()) return fallback.stats;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stats")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return fallback.stats;

  return (data as DbStat[]).map((row) => ({
    value: row.value,
    label: row.label,
    icon: resolveIcon(row.icon),
  }));
}

// ---------------------------------------------------------------------------
// Trust badges
// ---------------------------------------------------------------------------
export async function getTrustBadges(): Promise<TrustBadge[]> {
  if (!supabaseConfigured()) return fallback.trustBadges;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trust_badges")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return fallback.trustBadges;

  return (data as DbTrustBadge[]).map((row) => ({
    label: row.label,
    subtext: row.subtext ?? undefined,
    icon: resolveIcon(row.icon),
    variant: row.variant,
  }));
}

// ---------------------------------------------------------------------------
// CTA links
// ---------------------------------------------------------------------------
export async function getCTALinks(): Promise<CTALink[]> {
  if (!supabaseConfigured()) return fallback.ctaLinks;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cta_links")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return fallback.ctaLinks;

  return (data as DbCTALink[]).map((row) => {
    const Icon = resolveIcon(row.icon) ?? fallback.ctaLinks[0].icon;
    return {
      title: row.title,
      description: row.description,
      href: row.href ?? undefined,
      accent: row.accent,
      icon: Icon,
      // External links open in a new tab (WhatsApp, catalog, etc.).
      external: row.href ? row.href.startsWith("http") : undefined,
    };
  });
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export async function getReviews(): Promise<Review[]> {
  if (!supabaseConfigured()) return fallback.reviews;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return fallback.reviews;

  return (data as DbReview[]).map((row) => ({
    rating: row.rating as 1 | 2 | 3 | 4 | 5,
    quote: row.quote,
    name: row.name,
    location: row.location,
    identity: row.identity ?? undefined,
  }));
}

// ---------------------------------------------------------------------------
// Social links
// ---------------------------------------------------------------------------
export async function getSocialLinks(): Promise<SocialLink[]> {
  if (!supabaseConfigured()) return fallback.socialLinks;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return fallback.socialLinks;

  return (data as DbSocialLink[]).map((row) => ({
    label: row.label,
    href: row.href,
    icon: resolveIcon(row.icon) ?? fallback.socialLinks[0].icon,
    ariaLabel: row.aria_label,
  }));
}

// ---------------------------------------------------------------------------
// Catalog (used by /katalog pages)
// ---------------------------------------------------------------------------
export async function getProducts() {
  if (!supabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function getCategories() {
  if (!supabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data;
}

export interface CatalogCategory {
  id: string;
  label: string;
  products: { id: string; catalogue: string; image: string; alt: string; price: number | null }[];
}

/**
 * Slug kategori yang disembunyikan dari katalog publik (beserta produk &
 * link sitemap-nya). Baris datanya tetap ada di Supabase — hapus slug dari
 * daftar ini untuk menampilkannya kembali.
 * "basketball" = duplikat tidak disengaja dari kategori "basket".
 */
const HIDDEN_CATEGORY_SLUGS = new Set(["basketball"]);

export async function getCatalogData(): Promise<CatalogCategory[] | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();

  const [{ data: categories, error: catErr }, { data: products, error: prodErr }] = await Promise.all([
    supabase.from("product_categories").select("id, name, slug").order("sort_order"),
    supabase
      .from("products")
      .select("id, name, slug, category_id, price, product_images(url, alt, sort_order)")
      .order("sort_order"),
  ]);

  if (catErr || prodErr || !categories?.length) return null;

  return categories
    .filter((cat) => !HIDDEN_CATEGORY_SLUGS.has(cat.slug))
    .map((cat) => ({
    id: cat.slug,
    label: cat.name,
    products: (products ?? [])
      .filter((p) => p.category_id === cat.id)
      .sort((a, b) => {
        const numA = parseInt(a.name.replace(/\D+/g, ""), 10) || 0;
        const numB = parseInt(b.name.replace(/\D+/g, ""), 10) || 0;
        return numA - numB;
      })
      .map((p) => ({
        id: p.id,
        catalogue: p.name,
        image: cloudinaryUrl((p as any).product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)?.[0]?.url ?? "/products/placeholder.svg", { width: 400 }),
        alt: p.name,
        price: (p as any).price ?? null,
      })),
  }));
}

// ---------------------------------------------------------------------------
// Katalog Features (Keunggulan section)
// ---------------------------------------------------------------------------
export interface KatalogFeature {
  id: string;
  section: "feature" | "info";
  icon: string | null;
  title: string;
  description: string;
  sortOrder: number;
}

export async function getKatalogFeatures(): Promise<KatalogFeature[] | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("katalog_features")
    .select("*")
    .order("section")
    .order("sort_order", { ascending: true });

  if (error || !data?.length) return null;

  return data.map((row) => ({
    id: row.id,
    section: row.section as "feature" | "info",
    icon: row.icon,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
  }));
}

// ---------------------------------------------------------------------------
// Katalog Testimonials
// ---------------------------------------------------------------------------
export interface KatalogTestimonial {
  id: string;
  name: string;
  city: string;
  team: string;
  quote: string;
  imageUrl: string | null;
  rating: number;
  badge: string;
}

export async function getKatalogTestimonials(): Promise<KatalogTestimonial[] | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("katalog_testimonials")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data?.length) return null;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    city: row.city,
    team: row.team,
    quote: row.quote,
    imageUrl: row.image_url,
    rating: row.rating,
    badge: row.badge ?? "Verified Buyer",
  }));
}

// ---------------------------------------------------------------------------
// Fabrics (bahan kain)
// ---------------------------------------------------------------------------
const FABRIC_GROUP_ORDER: FabricGroupId[] = ["jacquard", "base", "embossed"];

export async function getFabrics(): Promise<Fabric[]> {
  if (!supabaseConfigured()) return fallback.fabrics;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fabrics")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return fallback.fabrics;

  return (data as DbFabric[])
    .map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      group: row.fabric_group,
      image: cloudinaryUrl(row.image_url ?? "/products/placeholder.svg", { width: 400 }),
      description: row.description,
    }))
    .sort((a, b) => {
      const d = FABRIC_GROUP_ORDER.indexOf(a.group) - FABRIC_GROUP_ORDER.indexOf(b.group);
      return d !== 0 ? d : 0;
    });
}

// ---------------------------------------------------------------------------
// Fantasy Club Products
// ---------------------------------------------------------------------------
export interface FantasyClubProduct {
  code: string;
  name: string;
  image: string;
  alt: string;
}

export async function getFantasyClubProducts(): Promise<FantasyClubProduct[]> {
  if (!supabaseConfigured()) return [];
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("product_categories")
    .select("id")
    .eq("slug", "fantasy-club")
    .single();

  if (!category) return [];

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, product_images(url, alt, sort_order)")
    .eq("category_id", category.id)
    .order("sort_order");

  if (error || !products?.length) return [];

  return products.map((p) => {
    const img = (p as any).product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)?.[0];
    return {
      code: p.slug?.toUpperCase().replace(/-/g, "-") ?? p.id.slice(0, 8).toUpperCase(),
      name: p.name,
      image: cloudinaryUrl(img?.url ?? "/products/placeholder.svg", { width: 600 }),
      alt: img?.alt ?? p.name,
    };
  });
}
