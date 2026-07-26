"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { JobStatus } from "@/lib/types";

export function JobStatusToggle({ jobId, status }: { jobId: string; status: JobStatus }) {
  const router = useRouter();
  const showToast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleToggle() {
    setIsLoading(true);
    setShowConfirm(false);
    try {
      const res = await fetch(`/api/rekrutmen/lowongan/${jobId}`, { method: "PATCH" });
      if (!res.ok) {
        showToast("Gagal mengubah status lowongan.", "error");
        return;
      }
      showToast(status === "dibuka" ? "Lowongan ditutup." : "Lowongan dibuka kembali.");
      router.refresh();
    } catch {
      showToast("Gagal mengubah status lowongan — cek koneksi kamu.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-surface px-2.5 py-1 text-xs font-medium hover:bg-surface-muted transition-colors disabled:opacity-60"
      >
        {isLoading && <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />}
        {status === "dibuka" ? "Tutup Lowongan" : "Buka Kembali"}
      </button>
      <ConfirmDialog
        open={showConfirm}
        title={status === "dibuka" ? "Tutup lowongan ini?" : "Buka kembali lowongan ini?"}
        message={status === "dibuka" ? "Kandidat baru tidak bisa melamar ke lowongan yang ditutup." : "Lowongan akan muncul kembali di halaman karir."}
        confirmLabel={status === "dibuka" ? "Ya, tutup" : "Ya, buka"}
        variant={status === "dibuka" ? "warning" : "warning"}
        onConfirm={handleToggle}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
