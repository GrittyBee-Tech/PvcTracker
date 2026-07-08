import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { auth } from "@/lib/auth";

type SignPayload = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  uploadPreset: string;
  folder?: string;
};

function buildCloudinarySignature(params: Record<string, string>, secret: string) {
  const toSign = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${toSign}${secret}`).digest("hex");
}

export const POST = async (request: Request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "pvc-waka/volunteers";

    if (!cloudName || !uploadPreset || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary signed upload is not fully configured" },
        { status: 500 },
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign: Record<string, string> = {
      folder,
      timestamp: String(timestamp),
      upload_preset: uploadPreset,
    };

    const signature = buildCloudinarySignature(paramsToSign, apiSecret);

    const response: SignPayload = {
      timestamp,
      signature,
      apiKey,
      cloudName,
      uploadPreset,
      folder,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error creating Cloudinary upload signature:", error);
    return NextResponse.json(
      { error: "Failed to create upload signature" },
      { status: 500 },
    );
  }
};
