"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/toast-provider";
import type { LeaveRequest } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  cuti_tahunan: "Cuti Tahunan",
  sakit: "Sakit",
  izin: "Izin",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ApprovalList({
  requests,
  employeeNames,
}: {
  requests: LeaveRequest[];
  employeeNames: Record<string, string>;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDecision(id: string, decision: "disetujui" | "ditolak") {
    setError(null);
    setLoadingId(id);
    try {
      const res = await fetch(`/api/cuti/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal memproses keputusan.");
        showToast(data.message ?? "Gagal memproses keputusan.", "error");
        return;
      }
      showToast(decision === "disetujui" ? "Pengajuan disetujui." : "Pengajuan ditolak.");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      showToast("Gagal memproses keputusan — cek koneksi kamu.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Tidak ada pengajuan yang menunggu persetujuanmu.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="rounded-[10px] bg-danger/10 border border-danger/30 px-3.5 py-2.5 text-sm text-danger"
        >
          {error}
        </div>
      )}
      {requests.map((r) => (
        <div key={r.id} className="rounded-[10px] border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                {employeeNames[r.employeeId] ?? "—"} · {TYPE_LABEL[r.type]}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(r.startDate)} — {formatDate(r.endDate)}
              </p>
              <p className="text-sm text-foreground/80 mt-2">{r.reason}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDecision(r.id, "disetujui")}
                disabled={loadingId === r.id}
                aria-label="Setujui"
                className="h-9 w-9 flex items-center justify-center rounded-[8px] bg-success/10 text-success hover:bg-success/20 transition-colors disabled:opacity-50"
              >
                {loadingId === r.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleDecision(r.id, "ditolak")}
                disabled={loadingId === r.id}
                aria-label="Tolak"
                className="h-9 w-9 flex items-center justify-center rounded-[8px] bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
