import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";

export const metadata: Metadata = {
  title: "Kebijakan Privasi Pelamar",
  description:
    "Bagaimana PT EgaLog Indonesia mengumpulkan, memakai, dan menyimpan data pelamar kerja.",
  robots: { index: false, follow: false },
};

export default function PrivasiLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
