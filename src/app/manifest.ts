import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EgaLog HR — PT EgaLog Indonesia",
    short_name: "EgaLog HR",
    description:
      "Sistem manajemen karyawan internal PT EgaLog Indonesia — absensi, cuti, payroll, performance review, dan rekrutmen.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "id",
    // Warna latar splash screen saat app baru dibuka — samain dengan warna
    // background asli halaman (bukan navy brand) supaya transisinya mulus,
    // bukan "kedip" navy sebelum konten kelihatan.
    background_color: "#f5f4ef",
    // Warna chrome/status bar OS saat app di-install & dibuka standalone.
    theme_color: "#1e2a44",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/512-maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
