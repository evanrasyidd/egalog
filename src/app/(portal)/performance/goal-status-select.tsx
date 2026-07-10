"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { GoalStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: GoalStatus; label: string }[] = [
  { value: "belum_mulai", label: "Belum Mulai" },
  { value: "berjalan", label: "Berjalan" },
  { value: "tercapai", label: "Tercapai" },
  { value: "tidak_tercapai", label: "Tidak Tercapai" },
];

export function GoalStatusSelect({
  goalId,
  currentStatus,
}: {
  goalId: string;
  currentStatus: GoalStatus;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(newStatus: GoalStatus) {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/performance/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal update status.");
        return;
      }
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentStatus}
        disabled={isLoading}
        onChange={(e) => handleChange(e.target.value as GoalStatus)}
        className="rounded-[8px] border border-border bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" strokeWidth={2} />}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
