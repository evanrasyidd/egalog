"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, TriangleAlert } from "lucide-react";
import { GoalStatusSelect } from "../../goal-status-select";
import { formatCycleLabel } from "@/lib/format";
import type { Goal } from "@/lib/types";

export function GoalManager({
  employeeId,
  cycle,
  initialGoals,
}: {
  employeeId: string;
  cycle: string;
  initialGoals: Goal[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddGoal(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/performance/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, cycle, title, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal menambah goal.");
        return;
      }
      setTitle("");
      setDescription("");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddGoal} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="goal-title" className="text-sm font-medium">
            Judul Goal
          </label>
          <input
            id="goal-title"
            type="text"
            required
            minLength={3}
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mis. Tingkatkan akurasi stok gudang ke 99%"
            className="w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="goal-description" className="text-sm font-medium">
            Deskripsi (opsional)
          </label>
          <textarea
            id="goal-description"
            rows={2}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-[10px] bg-danger/10 border border-danger/30 px-3.5 py-2.5 text-sm text-danger"
          >
            <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
            <span>{error}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <Plus className="h-4 w-4" strokeWidth={1.75} />
          )}
          Tambah Goal
        </button>
      </form>

      {initialGoals.length > 0 && (
        <div className="space-y-3 border-t border-border pt-4">
          {initialGoals.map((g) => (
            <div key={g.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <p className="text-sm font-medium">{g.title}</p>
                  <p className="text-xs text-muted-foreground">{formatCycleLabel(g.cycle)}</p>
                </div>
              </div>
              {g.description && <p className="text-sm text-foreground/80 mb-2">{g.description}</p>}
              <GoalStatusSelect goalId={g.id} currentStatus={g.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
