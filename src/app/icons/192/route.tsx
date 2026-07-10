import { ImageResponse } from "next/og";
import { renderBrandMark } from "@/lib/brand-icon";

export const contentType = "image/png";

// Icon ini statis (nggak pernah berubah kecuali kode-nya sendiri diubah) —
// tanpa cache header, tiap request bakal nge-generate ulang gambarnya lewat
// Satori (biaya Function Invocation + Active CPU sia-sia). immutable + max-age
// setahun aman karena kalau desainnya diubah, hasil deploy baru otomatis
// dapat URL/hash baru dari Next.js, bukan nimpa cache lama.
export async function GET() {
  return new ImageResponse(renderBrandMark({ size: 192 }), {
    width: 192,
    height: 192,
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
