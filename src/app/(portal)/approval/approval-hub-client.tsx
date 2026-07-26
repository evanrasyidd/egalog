"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface ApprovalItem {
  id: string;
  type: "cuti";
  employeeName: string;
  typeLabel: string;
  startDate: string;
  endDate: string;
  reason: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ApprovalHubClient({ initialItems }: { initialItems: ApprovalItem[] }) {
  const router = useRouter();
  const showToast = useToast();
  const [items, setItems] = useState(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ id: string } | null>(null);

  async function handleDecision(id: string, decision: "disetujui" | "ditolak") {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/cuti/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message ?? "Gagal memproses.", "error");
        setLoadingId(null);
        return;
      }
      showToast(decision === "disetujui" ? "Disetujui." : "Ditolak.");
      setItems((prev) => prev.filter((i) => i.id !== id));
      router.refresh();
    } catch {
      showToast("Gagal memproses.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Tidak ada pengajuan yang menunggu persetujuanmu.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-[10px] border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                {item.employeeName} · {item.typeLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(item.startDate)} — {formatDate(item.endDate)}
              </p>
              <p className="text-sm text-foreground/80 mt-2">{item.reason}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDecision(item.id, "disetujui")}
                disabled={loadingId === item.id}
                aria-label="Setujui"
                className="h-9 w-9 flex items-center justify-center rounded-[8px] bg-success/10 text-success hover:bg-success/20 transition-colors disabled:opacity-50"
              >
                {loadingId === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
              <button
                type="button"
                onClick={() => setRejectTarget({ id: item.id })}
                disabled={loadingId === item.id}
                aria-label="Tolak"
                className="h-9 w-9 flex items-center justify-center rounded-[8px] bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={rejectTarget !== null}
        title="Tolak pengajuan?"
        message="Pengajuan ini akan ditolak dan tidak bisa dibatalkan."
        confirmLabel="Ya, tolak"
        variant="danger"
        onConfirm={() => {
          if (rejectTarget) handleDecision(rejectTarget.id, "ditolak");
          setRejectTarget(null);
        }}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}
