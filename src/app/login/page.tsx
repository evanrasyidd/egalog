import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { DemoAccountsPopover } from "./demo-accounts-popover";
import { Boxes } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-primary text-primary-foreground p-12">
        <div className="flex items-center gap-2.5">
          <Boxes className="h-6 w-6" strokeWidth={1.75} />
          <span className="font-semibold tracking-tight text-lg">EgaLog HR</span>
        </div>

        <div className="space-y-6">
          <p className="text-sm uppercase tracking-wider text-primary-foreground/60 font-medium">
            PT EgaLog Indonesia
          </p>
          <h1 className="text-3xl font-semibold leading-snug tracking-tight max-w-md">
            Satu platform untuk mengelola tim operasional Anda — dari kantor
            pusat hingga gudang, dari Owner hingga Staff.
          </h1>
          <ul className="space-y-2 text-sm text-primary-foreground/75 font-mono">
            <li>Owner → Direktur → Manager → Supervisor → Staff</li>
            <li>6 departemen · 19 karyawan aktif</li>
          </ul>
        </div>

        <p className="text-xs text-primary-foreground/50">
          Portal internal EgaLog — akses khusus untuk karyawan terverifikasi.{" "}
          <Link href="/karir" className="underline hover:text-primary-foreground/80">
            Cari lowongan kerja di EgaLog →
          </Link>
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <Boxes className="h-5 w-5 text-primary" strokeWidth={1.75} />
            <span className="font-semibold tracking-tight">EgaLog HR</span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight">Masuk ke Portal Karyawan</h2>
            <p className="text-sm text-muted-foreground">
              Gunakan email dan kata sandi resmi perusahaan Anda untuk melanjutkan.
            </p>
          </div>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          <div className="flex justify-center">
            <DemoAccountsPopover />
          </div>
        </div>
      </div>
    </div>
  );
}
