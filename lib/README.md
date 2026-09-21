# `lib/` — Modul logika bersama

Satu file = satu tanggung jawab. Hampir semua logika bisnis non-UI ada di sini, dipakai bersama oleh
halaman (server component) dan API routes.

## Order & produksi

| File | Isi |
| --- | --- |
| `types.ts` | Definisi tipe + konstanta domain: `ORDER_STATUS_LIST` (11 tahap produksi), `ORDER_STATUS_LABELS`, `STEP_PROGRESS` (persentase per tahap), `ORDER_PHOTO_STAGES`, tipe `Order` |
| `order-status.ts` | **Satu sumber kebenaran** aturan "status → tahap → progress": `stepFromStatus`, `progressPercentFromStatus`, `isOrderCompleted`, `nextStageLabel`, `statusFromStep`, normalisasi status/tahap lama (`print` → `cetak_print`, dst.) |
| `queries-orders.ts` | Akses data order: `getOrderByTracking` (memverifikasi nomor HP sebelum mengembalikan data), `getAllOrders`, `getOrderById`, `generateOrderNumber`, `stripWoPhoto` |

Kalau menambah atau mengubah tahap produksi, mulai dari `types.ts` lalu sesuaikan `order-status.ts`
dan nama tahap di `fonnte.ts` (template WA).

## Notifikasi WhatsApp

| File | Isi |
| --- | --- |
| `fonnte.ts` | Integrasi Fonnte: nama tahap jersey & maklon, template pesan (`buildWhatsAppMessage`, `buildMaklonWhatsAppMessage`), URL tracking publik, `sendFonnteMessage` (timeout 10 detik), `triggerStageNotification` & `triggerMaklonStageNotification`, ambil token dari `app_settings` |
| `fonnte-crypto.ts` | Enkripsi/dekripsi token Fonnte (AES-256-GCM, key dari `SETTINGS_ENCRYPTION_KEY`). Token tidak pernah dikirim ke browser |
| `wa.ts` | Normalisasi & validasi nomor WhatsApp + `buildWhatsAppLink` (satu tempat untuk aturan format internasional) |
| `verify-token.ts` | Token tracking bertanda tangan HMAC: `signToken`, `verifyToken`, `signTrackingToken` (berlaku 30 hari), `buildSetCookie` |
| `rate-limit.ts` | Rate limiter in-memory sliding window (`checkRateLimit`) untuk endpoint admin/update tahap. Per-instance server, bukan global |

## Data & konten

| File | Isi |
| --- | --- |
| `queries.ts` | Akses data situs publik (server-side). Semua fungsi mencoba Supabase dulu dan jatuh ke data statis kalau database tidak bisa dihubungi: `getBrand`, `getCatalogData`, `getKatalogFeatures`, `getKatalogTestimonials`, `getFabrics`, dan lain-lain |
| `data.ts` | Data fallback statis (brand, stats, trust badges, CTA links, reviews, fabrics, social links). Ini jaring pengaman, bukan sumber kebenaran saat runtime |
| `products.ts` | Katalog statis + helper desain: `CATALOG_PRODUCTS` (fallback per kategori), `productDesignKey` (slug desain untuk URL), `findProductByDesignKey`, `getWhatsAppLink` |
| `category-landing.ts` | Config lengkap sembilan landing page kategori (hero, copywriting, harga, testimoni, FAQ, template WA, SEO). Menambah kategori = menambah satu entry di sini |
| `seo.ts` | `resolveSeoCatalog` dan helper metadata/schema.org untuk halaman katalog & kategori |
| `icon-registry.ts` | Registry nama ikon dari database → komponen React, lengkap dengan warna brand per platform sosial |

## Supabase & keamanan

| File | Isi |
| --- | --- |
| `supabase/client.ts` | Supabase client untuk browser |
| `supabase/server.ts` | Supabase client untuk server (cookie session mengalir otomatis) |
| `supabase/middleware.ts` | Refresh session Supabase, dipanggil dari `middleware.ts` di root |
| `admin-auth.ts` | `hasAdminAccess()` — cek akses dashboard: cookie `pesanan_auth` (shared password) **atau** user Supabase terautentikasi (CMS `/admin`) |
| `cloudinary.ts` | Helper Cloudinary: `uploadToCloudinary` (unsigned upload) dan `cloudinaryUrl` (transformasi `f_auto,q_auto`) |

## Lain-lain

| File | Isi |
| --- | --- |
| `utils.ts` | `cn()` — penggabung className (`clsx` + `tailwind-merge`) |
