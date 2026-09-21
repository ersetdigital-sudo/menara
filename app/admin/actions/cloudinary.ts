"use server";

/**
 * Returns public Cloudinary config for UNSIGNED uploads.
 * No API key/secret — the upload preset handles access control.
 */
export async function getCloudinarySignature(params: {
  folder?: string;
}) {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    folder: params.folder ?? "products",
  };
}
