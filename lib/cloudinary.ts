/**
 * Cloudinary — upload gambar dari sisi browser.
 *
 * Menara memakai preset UNSIGNED (env NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME /
 * NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET), jadi browser boleh langsung
 * mengirim berkas tanpa tanda tangan dari server. Folder dikirim pemanggil
 * (`{ folder: "menara-design-preview" }`).
 *
 * Berkas ini di-import komponen client, jadi JANGAN pernah menaruh API
 * secret di sini.
 *
 * Dua hal yang membuat upload terasa ringan:
 *
 *  1. Foto DIPERKECIL dulu di browser (lihat downscaleImage) sebelum dikirim.
 *     Foto kamera HP 4000 px & 4 MB jadi ±1600 px & ±300 KB — yang disimpan
 *     di Cloudinary jauh lebih kecil, dan pengirimannya jauh lebih cepat.
 *  2. Setiap langkah melaporkan dirinya ke lib/upload-progress.ts, jadi
 *     dashboard bisa menampilkan "Mengunggah 320 KB · 45%" tanpa satu pun
 *     pemanggil `uploadToCloudinary` perlu menambah parameter.
 */
import {
  beginUpload,
  failUpload,
  finishUpload,
  formatBytes,
  markUploadReady,
  setUploadPercent,
} from "@/lib/upload-progress";

/** Batas ukuran BERKAS ASLI yang boleh dipilih operator. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Sisi terpanjang gambar yang perlu disimpan ke Cloudinary.
 *
 *  Lightbox di dashboard/status menampilkan maksimal 1600px. Menyimpan versi
 *  4000px dari foto kamera HP tidak menambah apa pun yang bisa dilihat orang,
 *  tapi ikut ditagih sebagai storage dan bandwidth setiap kali foto dikirim. */
export const MAX_UPLOAD_DIMENSION = 1600;

/** Kualitas JPEG saat foto diperkecil ulang.
 *  0.82 masih sulit dibedakan mata untuk foto, tapi ukurannya jauh lebih
 *  kecil daripada 0.95. */
export const JPEG_QUALITY = 0.82;

/**
 * Periksa berkas sebelum diunggah (hanya ukuran — format diserahkan ke
 * Cloudinary, sama seperti sebelumnya, supaya tidak ada berkas yang dulu
 * bisa diunggah lalu berubah jadi ditolak).
 * Mengembalikan pesan kesalahan siap-tampil, atau null kalau berkas lolos.
 */
export function validateImageFile(file: File): string | null {
  if (file.size > MAX_IMAGE_BYTES) {
    return `Ukuran ${formatBytes(file.size)} melebihi batas ${formatBytes(MAX_IMAGE_BYTES)}. File ini tidak bisa dikecilkan otomatis — pakai gambar lain.`;
  }
  return null;
}

/**
 * Ukuran gambar tanpa mendekode seluruh pikselnya.
 *
 * Memakai elemen <img> + object URL: browser cuma membaca header berkas untuk
 * mengisi naturalWidth/naturalHeight, jadi hasilnya hampir instan walau fotonya
 * 12 MP. Dipakai untuk MEMUTUSKAN perlu diperkecil atau tidak — supaya foto
 * yang sudah cukup kecil tidak didekode penuh hanya untuk dibuang lagi.
 *
 * `null` = ukuran tidak terbaca; pemanggil kembali ke jalur lama (dekode penuh).
 */
function readImageSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const done = (size: { width: number; height: number } | null) => {
      URL.revokeObjectURL(url);
      resolve(size);
    };
    img.onload = () =>
      done(img.naturalWidth && img.naturalHeight
        ? { width: img.naturalWidth, height: img.naturalHeight }
        : null);
    img.onerror = () => done(null);
    img.src = url;
  });
}

/**
 * Perkecil foto di browser SEBELUM dikirim ke Cloudinary.
 *
 * Aturannya sengaja konservatif: kalau ragu, KIRIM BERKAS ASLINYA. Gagal
 * memperkecil tidak boleh bikin operator tidak bisa upload.
 */
async function downscaleImage(
  file: File
): Promise<{ blob: Blob; filename: string }> {
  const asIs = { blob: file as Blob, filename: file.name || "foto.jpg" };

  // Browser lawas (mis. Safari lama) tidak punya createImageBitmap.
  if (typeof createImageBitmap !== "function") return asIs;

  // Jalur cepat: foto yang dimensinya sudah cukup kecil dikirim apa adanya —
  // tidak perlu didekode penuh dulu.
  const probed = await readImageSize(file);
  if (probed && Math.max(probed.width, probed.height) <= MAX_UPLOAD_DIMENSION) {
    return asIs;
  }

  let bitmap: ImageBitmap;
  try {
    // `from-image` menghormati orientasi EXIF. Tanpa ini, foto HP yang
    // dipotret miring akan tersimpan miring setelah digambar ulang ke canvas.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return asIs;
  }

  try {
    const longest = Math.max(bitmap.width, bitmap.height);
    if (longest <= MAX_UPLOAD_DIMENSION) return asIs;

    const scale = MAX_UPLOAD_DIMENSION / longest;
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return asIs;

    // PNG bisa punya bagian transparan (mockup desain jersey sering begitu).
    // Kalau dipaksa jadi JPEG, area transparan itu berubah jadi hitam — jadi
    // untuk PNG keluarannya tetap PNG, dan penghematannya datang dari dimensi.
    const keepPng = file.type === "image/png";
    if (!keepPng) {
      // JPEG tidak punya alpha; putih adalah latar paling aman.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, keepPng ? "image/png" : "image/jpeg", JPEG_QUALITY)
    );

    // Kalau hasilnya ternyata TIDAK lebih kecil (mis. PNG kecil tapi padat),
    // pakai berkas aslinya.
    if (!blob || blob.size >= file.size) return asIs;

    const ext = keepPng ? "png" : "jpg";
    const base = (file.name || "foto").replace(/\.[^.]+$/, "");
    return { blob, filename: base + "." + ext };
  } catch {
    return asIs;
  } finally {
    bitmap.close();
  }
}

/**
 * Kirim berkas ke Cloudinary sambil melaporkan persentasenya.
 *
 * Memakai XMLHttpRequest, bukan fetch: hanya XHR yang memberi event progres
 * pengiriman (`upload.onprogress`). Dengan `fetch`, satu-satunya kabar yang
 * bisa ditampilkan adalah "sedang mengunggah" tanpa angka — dan untuk foto
 * 300 KB di jaringan seluler, menunggu tanpa angka itulah yang terasa lambat.
 * Pesan kesalahannya sengaja sama dengan versi fetch sebelumnya supaya teks
 * di dashboard tidak berubah.
 */
function postToCloudinary(
  url: string,
  formData: FormData,
  jobId: number
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    // Tanpa batas waktu, koneksi yang macet membuat indikatornya berputar
    // selamanya tanpa kabar apa pun. Dua menit jauh di atas waktu kirim foto
    // 300 KB, bahkan di jaringan seluler lambat.
    xhr.timeout = 120_000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadPercent(jobId, e.loaded, e.total);
    };
    xhr.onload = () => {
      let data: any = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }
      if (xhr.status >= 200 && xhr.status < 300 && data) {
        resolve(data);
        return;
      }
      reject(new Error(data?.error?.message || "Upload failed"));
    };
    xhr.onerror = () => reject(new Error("Koneksi terputus saat upload. Coba lagi."));
    xhr.ontimeout = () => reject(new Error("Upload terlalu lama. Coba lagi."));

    xhr.send(formData);
  });
}

/**
 * Upload satu gambar ke Cloudinary.
 *
 * Tiga langkah: periksa ukuran, perkecil di browser, lalu kirim. Semua jalur
 * keluar (berhasil/gagal) wajib menutup indikator di lib/upload-progress.ts,
 * jadi alurnya dibungkus di uploadToCloudinary — kalau tidak, kartu progres
 * bisa menggantung selamanya.
 */
export async function uploadToCloudinary(
  file: File,
  params: { folder: string }
): Promise<{ url: string; public_id: string }> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary belum dikonfigurasi");
  }

  // Diumumkan ke indikator upload di dashboard; lihat lib/upload-progress.ts.
  const jobId = beginUpload(file.name || "foto", file.size);

  try {
    // Perkecil dulu di browser — inilah yang membuat upload cepat.
    const upload = await downscaleImage(file);

    // Sejak titik ini ukurannya sudah pasti — inilah angka yang dikirim ke
    // Cloudinary, dan itulah yang ditampilkan ke operator.
    markUploadReady(jobId, upload.blob.size);

    const formData = new FormData();
    formData.append("file", upload.blob, upload.filename);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", params.folder);

    const data = await postToCloudinary(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      jobId
    );
    finishUpload(jobId);
    return { url: data.secure_url, public_id: data.public_id };
  } catch (e) {
    failUpload(jobId);
    throw e;
  }
}
