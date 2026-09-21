export function cloudinaryUrl(
  url: string,
  transformations?: { width?: number; quality?: string }
): string {
  if (!url.includes("res.cloudinary.com")) return url;
  const w = transformations?.width ?? 400;
  const q = transformations?.quality ?? "auto";
  const tf = `w_${w},q_${q},f_auto,c_limit`;
  return url.replace("/upload/", `/upload/${tf}/`);
}

/**
 * Upload file to Cloudinary using the UNSIGNED upload preset
 * (env: CLOUDINARY_UPLOAD_PRESET + CLOUDINARY_CLOUD_NAME, both public-safe).
 * No API key/secret needed.
 */
export async function uploadToCloudinary(
  file: File,
  params: { folder: string }
): Promise<{ url: string; public_id: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary belum dikonfigurasi");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", params.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error?.message || "Upload failed");
  }
  const data = await res.json();
  return { url: data.secure_url, public_id: data.public_id };
}
