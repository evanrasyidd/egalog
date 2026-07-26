"use client";

import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="rounded-[10px] border border-danger/30 bg-danger/5 p-8 max-w-md w-full space-y-4">
        <p className="text-3xl">⚠️</p>
        <h1 className="text-lg font-semibold">Terjadi Kesalahan</h1>
        <p className="text-sm text-muted-foreground">
          Ada yang tidak beres saat memuat halaman ini. Silakan coba lagi atau
          kembali ke halaman utama.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
            Coba Lagi
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-surface-muted transition-colors"
          >
            <Home className="h-4 w-4" strokeWidth={1.75} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
