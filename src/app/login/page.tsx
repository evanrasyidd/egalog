import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { DemoAccountsPopover } from "./demo-accounts-popover";
import { BrandLogo } from "@/components/brand";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-primary text-primary-foreground p-12">
        <div className="flex items-center gap-3.5">
          <BrandLogo tone="reversed" className="h-8 w-auto" />
          <span className="border-l border-white/25 pl-3.5 text-[11px] font-mono uppercase tracking-[0.16em] text-primary-foreground/75">
            HR
          </span>
        </div>

        <div className="space-y-6">
          <p className="text-sm uppercase tracking-wider text-primary-foreground/60 font-medium">
            PT EgaLog Indonesia
          </p>
          <h2 className="text-3xl font-semibold leading-snug tracking-tight max-w-md">
            Satu platform untuk mengelola tim operasional — dari kantor pusat
            hingga gudang, dari Owner hingga Staff.
          </h2>
          <ul className="space-y-2 text-sm text-primary-foreground/75 font-mono">
            <li>Owner → Direktur → Manager → Supervisor → Staff</li>
            <li>6 departemen · 19 karyawan aktif</li>
          </ul>
        </div>

        <p className="text-xs text-primary-foreground/65">
          Portal internal EgaLog — akses khusus untuk karyawan terverifikasi.{" "}
          <Link href="/karir" className="underline hover:text-primary-foreground">
            Cari lowongan kerja di EgaLog →
          </Link>
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <BrandLogo className="h-7 w-auto" />
            <span className="border-l border-border pl-3 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
              HR
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Masuk ke Portal Karyawan</h1>
            <p className="text-sm text-muted-foreground">
              Gunakan email atau username, lalu masukkan kata sandi resmi
              perusahaanmu.
            </p>
          </div>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          <p className="text-xs text-muted-foreground">
            Lupa kata sandi? Hubungi Manager HR atau Admin lewat kanal internal
            untuk reset sementara.
          </p>

          <div className="flex justify-center">
            <DemoAccountsPopover />
          </div>
        </div>
      </div>
    </main>
  );
}
