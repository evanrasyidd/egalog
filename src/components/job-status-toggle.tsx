"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { JobStatus } from "@/lib/types";

export function JobStatusToggle({ jobId, status }: { jobId: string; status: JobStatus }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      await fetch(`/api/rekrutmen/lowongan/${jobId}`, { method: "PATCH" });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-surface px-2.5 py-1 text-xs font-medium hover:bg-surface-muted transition-colors disabled:opacity-60"
    >
      {isLoading && <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />}
      {status === "dibuka" ? "Tutup Lowongan" : "Buka Kembali"}
    </button>
  );
}
