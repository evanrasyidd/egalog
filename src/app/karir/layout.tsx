import Link from "next/link";
import { Boxes } from "lucide-react";

export default function KarirLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/karir" className="flex items-center gap-2.5">
          <Boxes className="h-5 w-5 text-primary" strokeWidth={1.75} />
          <span className="font-semibold tracking-tight">EgaLog</span>
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Portal Karyawan →
        </Link>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-surface px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} PT EgaLog Indonesia. Seluruh hak cipta dilindungi.</span>
          <span>Depok, Jawa Barat, Indonesia</span>
        </div>
      </footer>
    </div>
  );
}
