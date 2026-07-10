import { ImageResponse } from "next/og";
import { renderBrandMark } from "@/lib/brand-icon";

export const contentType = "image/png";

export async function GET() {
  return new ImageResponse(renderBrandMark({ size: 512, maskableSafeZone: true }), {
    width: 512,
    height: 512,
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
