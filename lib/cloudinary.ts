import "server-only";
import { createHash } from "node:crypto";

export function buildCloudinarySignature(
  params: Record<string, string>,
  secret: string,
) {
  const toSign = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${toSign}${secret}`).digest("hex");
}

/**
 * Extracts the public_id from a Cloudinary delivery URL, e.g.
 * https://res.cloudinary.com/<cloud>/image/upload/v123/pvc-waka/volunteers/abc.jpg
 * → "pvc-waka/volunteers/abc". Returns null for non-Cloudinary URLs.
 */
export function cloudinaryPublicId(url: string): string | null {
  try {
    const { hostname, pathname } = new URL(url);
    if (!hostname.endsWith("cloudinary.com")) return null;
    const match = /\/upload\/(?:[^/]*,[^/]*\/)*(?:v\d+\/)?(.+)$/.exec(pathname);
    if (!match) return null;
    return decodeURIComponent(match[1]).replace(/\.[a-z0-9]+$/i, "");
  } catch {
    return null;
  }
}

/** Deletes an image from Cloudinary. Throws if it can't be confirmed gone. */
export async function destroyCloudinaryImage(url: string): Promise<void> {
  const publicId = cloudinaryPublicId(url);
  if (!publicId) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured");
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = buildCloudinarySignature(
    { public_id: publicId, timestamp },
    apiSecret,
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        public_id: publicId,
        timestamp,
        api_key: apiKey,
        signature,
      }),
    },
  );
  const data = await response.json().catch(() => ({}));

  // "not found" means it's already gone, which is what we want.
  if (!response.ok || !["ok", "not found"].includes(data?.result)) {
    throw new Error(
      `Cloudinary destroy failed for ${publicId}: ${JSON.stringify(data)}`,
    );
  }
}
