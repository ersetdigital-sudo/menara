# `supabase/` — Skema database, RLS, dan RPC

Supabase (Postgres) menyimpan data operasional MENARA: pesanan jersey, pesanan maklon,
tahap produksi, pengaturan, dan log notifikasi WhatsApp.

Database ini **khusus operasional**. Modul landing page/katalog sudah dibuang beserta
tabelnya (migrasi `0029`), jadi tidak ada lagi tabel konten atau produk di sini.

## Model keamanan

**Tidak ada tabel yang bisa diakses anon.** Anon key memang ter-embed di bundle browser
(`NEXT_PUBLIC_SUPABASE_ANON_KEY`), jadi apa pun yang boleh dibaca anon sama dengan boleh
dibaca siapa saja.

- Seluruh akses ke tabel operasional lewat **service role** di server
  (`createServiceClient()` di `lib/supabase/server.ts`).
- Otorisasi diperiksa di **route handler** — `getAdminDb()` untuk dashboard, verifikasi
  nomor HP / token HMAC untuk halaman tracking — bukan diserahkan ke RLS.
- **Satu-satunya policy baca publik** yang tersisa: daftar nama tahap
  (`production_steps`, `maklon_steps`), karena halaman status customer menampilkan nama
  tahap. Read-only.
- Mendaftar akun publik di Supabase Auth sudah **dimatikan**.

> Riwayat: sampai migrasi `0026`, tabel operasional memakai policy `USING (true)` untuk
> role `public` (SELECT/INSERT/UPDATE, bahkan DELETE untuk maklon). Artinya siapa pun yang
> membuka DevTools bisa membaca seluruh data customer dan mengubah status order lewat REST
> API langsung. `0027` menutupnya. Untuk policy penuh, lihat `0027_lockdown_orders_rls.sql`.

## Tabel (10)

| Tabel | Isi |
| --- | --- |
| `orders` | Order jersey: nomor order, data customer, deadline, `current_status`, `current_stage`, `last_notified_stage`, `deadline_notified_at`, foto design/WO, `products` (jsonb) |
| `order_status_history` | Riwayat perubahan tahap per order — sumber timeline di halaman tracking |
| `production_steps` | Daftar 11 tahap produksi jersey, bisa diatur admin |
| `maklon_orders` | Order maklon (toll manufacturing) — tabel terpisah dengan 6 tahap sendiri |
| `maklon_status_history` | Riwayat tahap order maklon |
| `maklon_steps` | Daftar 6 tahap maklon |
| `notification_logs` | Log pengiriman WhatsApp: order, nomor, status kirim/gagal, respons. Unique `(order_id, stage)` = anti-duplikat |
| `maklon_notification_logs` | Idem untuk order maklon |
| `app_settings` | Key-value pengaturan: token Fonnte (AES-256-GCM), jadwal pengingat deadline, kapasitas produksi |
| `brand` | Identitas toko: `name`, `monogram`, `tagline`, `description`, `whatsapp_number`, `logo_path` |

## RPC (fungsi database)

| Fungsi | Kegunaan |
| --- | --- |
| `claim_stage_notification` / `claim_maklon_stage_notification` | Mengklaim slot pengiriman WA (anti-duplikat, aman dari race condition) |
| `finish_stage_notification` / `finish_maklon_stage_notification` | Menulis hasil pengiriman ke log |
| `mark_last_notified_stage` / `mark_maklon_last_notified_stage` | Menandai tahap terakhir yang WA-nya sudah terkirim |
| `get_app_setting_value` / `set_app_setting` | Baca/tulis pengaturan (nilai token tetap ciphertext) |
| `touch_updated_at` | Trigger pembaruan `updated_at` |

`drop_policy` dan `rls_auto_enable` adalah helper bawaan Supabase, bukan milik aplikasi.

## Migrasi

29 file, `0001` → `0029` (tanpa `0004`), dijalankan berurutan. Semua ada di `migrations/`,
tidak ada folder `seed/`.

| Rentang | Isi |
| --- | --- |
| `0001`–`0012` | Skema awal + modul landing page/katalog (sebagian besar sudah dibuang di `0029`) |
| `0013`–`0018` | Sistem order & tracking, kota/bahan, tahap produksi, deadline, foto design, `products` (jsonb) |
| `0019`–`0021` | Notifikasi Fonnte (log + `app_settings`), RPC, foto WO |
| `0022`–`0025` | Dedup deadline, `notification_logs`, alur maklon, notifikasi maklon |
| `0026` | Perbaikan domain brand |
| `0027` | **Menutup policy anon** pada tabel operasional |
| `0028` | Hapus CTA landing yang mengarah ke domain mati |
| `0029` | **Buang seluruh modul landing/katalog**: 13 tabel, 3 enum, 6 kolom `brand`, bucket storage `products` |

### ⚠️ Peringatan

- `0013_orders_tracking.sql` diawali `DROP TABLE IF EXISTS order_status_history` dan
  `DROP TABLE IF EXISTS orders`. Menjalankannya ulang di database produksi **menghapus
  data order**. Hanya jalankan terhadap database yang boleh di-reset.
- `0029` menghapus 13 tabel secara permanen dari database mana pun yang menjalankannya.
  Isinya sudah dibackup ke luar repo; skemanya masih bisa dibaca dari `0001` → `0028`.
- Penghapusan bucket storage di `0029` dibungkus `DO/EXCEPTION` karena tabel `storage`
  dimiliki role lain. Kalau gagal, hapus bucket lewat Storage API dengan service role:
  `DELETE {SUPABASE_URL}/storage/v1/bucket/products`.

## Konvensi

- Nama file: `NNNN_deskripsi_singkat.sql`, tanpa lompat nomor yang tidak disengaja.
- Perubahan skema yang menyentuh tabel notifikasi harus menyertakan policy RLS-nya.
- Tabel baru: tulis policy-nya sekalian, dan ingat bahwa **anon tidak boleh dapat akses** —
  akses server pakai service role.
