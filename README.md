# MENARA Admin Panel

Panel operasional MENARA — versi "kembar" dari sistem TNT Sport Apparel, tapi
pakai brand, warna, dan font MENARA. Fokus tahap ini: **core operasional**
(dashboard Pesanan & Maklon, tracking customer, notifikasi WhatsApp otomatis,
pengingat deadline).

Repo `tntsport` **tidak disentuh** — dia cuma dipakai sebagai referensi kode.

## Status

| Bagian | Status |
| --- | --- |
| Dashboard Pesanan (`/pesanan/orders`) | ✅ jalan |
| Dashboard Maklon (`/pesanan/maklon`) | ✅ jalan |
| Tracking customer (`/track`, `/status`, `/status/maklon`) | ✅ jalan |
| Notifikasi WhatsApp otomatis per tahap produksi | ✅ jalan (butuh token Fonnte) |
| Pengingat deadline (H-3/H-2/H-1) | ✅ jalan (butuh token Fonnte) |
| Database Supabase | ✅ sudah di-migrate (23 tabel + RPC) |
| Landing page katalog & CMS produk | ⛔ belum (di luar scope tahap ini) |

## Tampilan

Tampilan mengikuti mockup HTML MENARA (`../pages/index.html`):

| Token | Nilai |
| --- | --- |
| Aksen | `#FFE500` (kuning) |
| Sidebar | `#0C0C0D` (hitam) |
| Background | `#F5F5F4` |
| Kartu | `#FFFFFF` |
| Garis | `#ECECEB` |
| Teks | `#111113` / muted `#8A8A8F` |
| Font | Inter (satu keluarga font, dipakai untuk semua teks) |

Semua token dashboard ada di `app/globals.css` di blok `--pas-*` (cari
`PESANAN ADMIN DASHBOARD`).

## Setup lokal

```bash
pnpm install
cp .env.local.example .env.local   # lalu isi nilainya
pnpm dev                           # http://localhost:3000
```

### Environment variable

Wajib: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `SETTINGS_ENCRYPTION_KEY`,
`TRACK_SESSION_SECRET`, `PESANAN_PASSWORD`, `CRON_SECRET`.

Opsional (dibutuhkan untuk fitur tertentu):

- `CLOUDINARY_*` → upload foto desain & WO di dashboard.
- `META_CAPI_ACCESS_TOKEN` → server-side event Meta.

Token Fonnte **tidak** ditaruh di env: disimpan terenkripsi (AES-256-GCM) di
tabel `app_settings` dan diisi dari menu **Pengaturan** di dashboard.

## Database

Project Supabase: `msvacyexhcjqepfbdrez` (region `ap-southeast-1`).

Skema dibuat dari `supabase/migrations/*.sql` (26 berkas, dijalankan berurutan
`0001` → `0026`). Kalau perlu membuat project baru, jalankan migrasi tersebut
berurutan — jangan lompat, karena beberapa migrasi mengubah tabel dari migrasi
sebelumnya.

> ⚠️ `0013_orders_tracking.sql` dan `0023_notification_logs.sql` memakai
> `DROP TABLE` sebelum membuat ulang. Aman saat DB kosong, **jangan** dijalankan
> ulang di database yang sudah berisi data produksi.

## Alur produksi

11 tahap (satu sumber kebenaran di `lib/order-status.ts`):

`desain → layout → profing_warna → cetak_print → press_transfer → potong_pola → jahit → finishing → quality_control → packing → kirim`

Order maklon punya alur terpisah 6 tahap. Satu kali admin mengubah tahap,
sistem otomatis mencatat riwayat, menghitung progres, dan mengirim WhatsApp ke
customer (dedup lewat RPC `claim_stage_notification`).

## Nomor order

Format: `MNR` + `YYMMDD` + 4 digit urutan, contoh `MNR2609210001`.

## Yang masih perlu diisi

1. **Nomor WhatsApp MENARA** — masih placeholder `6281234567890`, ubah di tabel
   `brand` (kolom `whatsapp_number`) atau lewat menu Pengaturan.
2. **Kredensial Cloudinary** — belum diisi, jadi upload foto desain/WO belum
   aktif.
3. **Token Fonnte** — diisi di menu Pengaturan dashboard supaya notifikasi WA
   dan pengingat deadline jalan.
4. **Email admin** — `admin@menara.id` masih hardcoded di sidebar
   (`components/admin/*Dashboard.tsx`) dan halaman login.

## Screenshot

Screenshot hasil verifikasi ada di `../_shots/` (dashboard desktop, mobile,
maklon, halaman tracking, plus render mockup sebagai pembanding).
