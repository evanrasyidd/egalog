// Dipakai bareng oleh semua route icon (icon.tsx, apple-icon.tsx, dan route
// icon PWA di bawah /icons) supaya identitas visual (navy + amber "E") tetap
// konsisten di semua ukuran, bukan didesain ulang manual per file.

export const BRAND_NAVY = "#1E2A44";
export const BRAND_AMBER = "#C96A2E";

interface BrandMarkOptions {
  size: number;
  /**
   * Kalau true, beri padding ekstra di sekeliling mark supaya aman kalau
   * di-crop jadi lingkaran/bentuk lain (maskable icon Android). Tanpa ini,
   * mark bisa terpotong di ikon adaptif.
   */
  maskableSafeZone?: boolean;
  /** Sudut membulat. Diabaikan kalau maskableSafeZone true (mask sudah bulat). */
  borderRadius?: number;
}

export function renderBrandMark({
  size,
  maskableSafeZone = false,
  borderRadius,
}: BrandMarkOptions) {
  // Rekomendasi umum maskable icon: konten utama berada di ~80% area tengah.
  const markScale = maskableSafeZone ? 0.55 : 0.65;
  const fontSize = Math.round(size * markScale);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND_NAVY,
        borderRadius: maskableSafeZone ? 0 : borderRadius ?? Math.round(size * 0.18),
      }}
    >
      <span
        style={{
          color: BRAND_AMBER,
          fontSize,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        E
      </span>
    </div>
  );
}
