"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./brand";

const LANDING_LINKS = [
  { href: "/karir#lowongan", label: "Lowongan" },
  { href: "/karir#tentang", label: "Tentang" },
  { href: "/karir#fasilitas", label: "Fasilitas" },
  { href: "/karir#seleksi", label: "Alur seleksi" },
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isJobDetail = pathname.startsWith("/karir/lowongan/");
  const links = isJobDetail
    ? [{ href: "/karir#lowongan", label: "Semua lowongan" }]
    : LANDING_LINKS;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-[6px] focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Langsung ke konten
      </a>

      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex min-h-[76px] max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3.5 sm:gap-x-8 sm:px-6">
          <Link
            href="/karir"
            className="flex items-center gap-3.5"
            aria-label="EgaLog Karier"
          >
            <BrandLogo tone="reversed" className="h-7 w-auto sm:h-[34px]" />
            <span className="hidden border-l border-white/25 pl-3.5 text-[15px] text-primary-foreground/75 sm:inline">
              Karier
            </span>
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="flex flex-wrap items-center gap-x-7 gap-y-2 text-base font-medium"
          >
            <div className="hidden items-center gap-x-7 md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-primary-foreground transition-colors hover:text-accent-light"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Link
              href="/login"
              aria-label="Portal Karyawan"
              className="inline-flex min-h-11 items-center rounded-[6px] border-[1.5px] border-white/40 px-3 text-sm font-semibold text-primary-foreground transition-colors hover:border-primary-foreground hover:bg-white/5 sm:px-4 sm:text-[15px]"
            >
              <span className="sm:hidden">Portal</span>
              <span className="hidden sm:inline">Portal Karyawan</span>
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="bg-primary text-primary-foreground/75">
        <div className="mx-auto max-w-[1200px] px-6 pb-8 pt-16">
          <div className="flex flex-wrap justify-between gap-x-16 gap-y-10">
            <div className="max-w-[380px] flex-1 basis-[280px]">
              <BrandLogo tone="reversed" className="h-8 w-auto" />
              <p className="mt-4.5 text-base leading-relaxed">
                PT EgaLog Indonesia. Distribusi dan pergudangan untuk klien di
                seluruh Jabodetabek. Depok, Jawa Barat.
              </p>
            </div>

            <div className="flex-[0_1_240px]">
              <p className="text-sm font-semibold text-accent-light">Kontak</p>
              <a
                href="mailto:karir@egalog.co.id"
                className="mt-3 block text-[17px] font-semibold text-primary-foreground transition-colors hover:text-white"
              >
                karir@egalog.co.id
              </a>
              <p className="mt-1 text-[15px]">Senin–Jumat, 08.00–17.00 WIB</p>
            </div>

            <div className="flex-[0_1_200px]">
              <p className="text-sm font-semibold text-accent-light">Tautan</p>
              <ul className="mt-3 space-y-2 text-[17px]">
                <li>
                  <Link
                    href="/karir#lowongan"
                    className="text-primary-foreground transition-colors hover:text-white"
                  >
                    Lowongan terbuka
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privasi"
                    className="text-primary-foreground transition-colors hover:text-white"
                  >
                    Kebijakan privasi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-primary-foreground transition-colors hover:text-white"
                  >
                    Portal karyawan
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 border-t border-white/15 pt-5 text-[15px]">
            © {new Date().getFullYear()} PT EgaLog Indonesia
          </div>
        </div>
      </footer>
    </div>
  );
}
