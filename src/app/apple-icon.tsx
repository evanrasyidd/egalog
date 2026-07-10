import { ImageResponse } from "next/og";
import { renderBrandMark } from "@/lib/brand-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(renderBrandMark({ size: 180 }), { ...size });
}
