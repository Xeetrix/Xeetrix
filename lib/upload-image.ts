"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { SUPABASE_IMAGE_BUCKET } from "@/lib/constants";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export class ImageUploadError extends Error {}

function assertValidImageFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ImageUploadError(
      `"${file.name}" isn't a supported image type. Use JPG, PNG, WEBP, GIF, or AVIF.`
    );
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ImageUploadError(`"${file.name}" is larger than 5MB.`);
  }
}

function uniqueFileName(originalName: string) {
  const extension = originalName.includes(".")
    ? originalName.slice(originalName.lastIndexOf(".") + 1).toLowerCase()
    : "jpg";
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${id}.${extension}`;
}

/**
 * Uploads a single image file directly from the browser to the Supabase
 * Storage bucket configured in SUPABASE_IMAGE_BUCKET, under `folder/`, and
 * returns its public URL. Requires the bucket to be public-readable with a
 * Storage policy allowing INSERT for the `anon` role (see README.md).
 */
export async function uploadImageToSupabase(
  file: File,
  folder: "categories" | "products"
): Promise<string> {
  assertValidImageFile(file);

  const supabase = getSupabaseBrowserClient();
  const path = `${folder}/${uniqueFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new ImageUploadError(`Upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(SUPABASE_IMAGE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new ImageUploadError("Upload succeeded but no public URL was returned.");
  }

  return data.publicUrl;
}
