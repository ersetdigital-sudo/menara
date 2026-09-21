# `supabase/` — Skema database, RLS, dan RPC

Supabase (Postgres) menyimpan seluruh data aplikasi: order, katalog, konten landing page,
pengaturan, dan log notifikasi.

## Model keamanan

Diambil dari header `migrations/0001_init.sql`:

- **anon (publik) boleh MEMBACA** semua tabel — landing page dan halaman katalog perlu mengambil
  konten tanpa login.
- **Hanya user terautentikasi yang boleh MENULIS** (admin lewat Supabase Auth).
- **Tidak ada isolasi per user** — semua admin mengelola konten yang sama. Ini disengaja untuk tim
  internal kecil.

Dashboard Pesanan (`/pesanan/*`) berjalan dengan **anon key tanpa session**. Karena tabelnya
authenticated-only, operasi DB untuk notifikasi dibungkus **RPC `SECURITY DEFINER`**
(`migrations/0020_fonnte_rpc.sql`) — izinnya lewat fungsi, bukan dengan membuka tabel ke publik.

## Tabel utama

| Tabel | Isi |
| --- | --- |
| `orders` | Order jersey: order number, data customer, deadline, `current_status`, `current_stage`, `last_notified_stage`, `deadline_notified_at`, foto design/WO, `products` (jsonb) |
| `order_status_history` | Riwayat perubahan tahap per order — sumber timeline di halaman tracking |
| `production_steps` | Daftar tahap produksi yang bisa diatur admin |
| `maklon_orders`, `maklon_status_history`, `maklon_steps` | Alur pesanan maklon (tabel & 6 tahap terpisah) |
| `notification_logs`, `maklon_notification_logs` | Log pengiriman WhatsApp: order, nomor, status kirim/gagal, respons, `diff_days`. Unique `(order_id, stage)` = anti-duplikat |
| `app_settings` | Key-value pengaturan: token Fonnte (terenkripsi), pengaturan pengingat deadline |
| `product_categories`, `products`, `product_images`, `product_variants` | Katalog (kategori bisa bertingkat lewat `parent_id`) |
| `brand`, `stats`, `trust_badges`, `cta_links`, `social_links`, `reviews`, `fabrics` | Konten landing page |
| `katalog_features`, `katalog_testimonials` | Konten halaman katalog |
| `page_views` | Pencatatan kunjungan halaman |

## RPC (fungsi database)

Dipakai untuk operasi yang tidak boleh dilakukan langsung dengan anon key:

| Fungsi | Kegunaan |
| --- | --- |
| `claim_stage_notification` / `claim_maklon_stage_notification` | Mengklaim slot pengiriman WA (anti-duplikat) |
| `finish_stage_notification` / `finish_maklon_stage_notification` | Menulis hasil pengiriman ke log |
| `mark_last_notified_stage` / `mark_maklon_last_notified_stage` | Menandai tahap terakhir yang WA-nya sudah dikirim |
| `get_app_setting_value` / `set_app_setting` | Baca/tulis pengaturan (nilai token tetap ciphertext) |
| `increment_page_views` | Menambah hitungan kunjungan |
| `touch_updated_at` | Trigger pembaruan `updated_at` |

## Migrasi

24 file, `0001` → `0025` (tanpa `0004`), dijalankan berurutan dari Supabase SQL Editor (tidak ada folder lain
seperti `seed/`, semua ada di `migrations/`).

| Rentang | Isi |
| --- | --- |
| `0001`–`0012` | Skema awal, rebranding, landing page & admin, konten katalog, Meta Pixel, kain, promo, page views, flash sale |
| `0013`–`0018` | Sistem order & tracking, kota/bahan, tahap produksi, deadline, foto design, `products` (jsonb) |
| `0019`–`0021` | Notifikasi Fonnte (log + `app_settings`), RPC `SECURITY DEFINER`, foto WO |
| `0022`–`0025` | Dedup deadline, `notification_logs`, alur maklon, notifikasi maklon |

### ⚠️ Peringatan sebelum menjalankan ulang migrasi

`migrations/0013_orders_tracking.sql` diawali dengan `DROP TABLE IF EXISTS order_status_history` dan
`DROP TABLE IF EXISTS orders`. Migrasi itu **menghapus data order yang ada** kalau dijalankan ulang
di database production. Hanya jalankan migrasi terhadap database yang memang boleh di-reset.

`0001_init.sql` bersifat idempotent (aman diulang) dan hanya menimpa data konten landing, bukan data
produk.

## Konvensi

- Nama file migrasi: `NNNN_deskripsi_singkat.sql`, tanpa lompat nomor yang tidak disengaja.
- Setiap perubahan skema yang menyentuh tabel notifikasi harus menyertakan policy RLS-nya —
  kalau tidak, dashboard Pesanan (anon key) akan gagal dengan error RLS.
