import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://egalog.co.id";

export const metadata: Metadata = {
  title: {
    default: "Karier di EgaLog — Lowongan Logistik & Pergudangan",
    template: "%s · Karier EgaLog",
  },
  description:
    "Bergabung dengan tim PT EgaLog Indonesia di Depok. Lihat lowongan operasional, armada, sales, finance, HR, dan IT di perusahaan distribusi & pergudangan Jabodetabek.",
  alternates: {
    canonical: "/karir",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Karir EgaLog",
    title: "Karier di EgaLog — Lowongan Logistik & Pergudangan",
    description:
      "Dari gudang sampai kantor pusat — temukan posisi yang cocok di EgaLog, Depok.",
    url: "/karir",
    images: [{ url: "/og-karir.png", width: 1200, height: 630, alt: "Karir EgaLog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karier di EgaLog",
    description: "Lowongan logistik & pergudangan di Jabodetabek.",
    images: ["/og-karir.png"],
  },
  metadataBase: new URL(SITE_URL),
};

export default function KarirLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
