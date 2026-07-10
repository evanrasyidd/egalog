"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Send, TriangleAlert, Lock } from "lucide-react";
import { COMPETENCIES, COMPETENCY_LABEL } from "@/lib/types";
import type { Competency } from "@/lib/types";

const SCORE_OPTIONS = [1, 2, 3, 4, 5];

interface ExistingReview {
  id: string;
  scores: Record<Competency, number>;
  strengths: string;
  areasForImprovement: string;
  status: "draft" | "selesai";
}

function defaultScores(): Record<Competency, number> {
  return Object.fromEntries(COMPETENCIES.map((c) => [c, 3])) as Record<Competency, number>;
}

export function ReviewForm({
  employeeId,
  cycle,
  existingReview,
}: {
  employeeId: string;
  cycle: string;
  existingReview: ExistingReview | null;
}) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<Competency, number>>(
    existingReview?.scores ?? defaultScores(),
  );
  const [strengths, setStrengths] = useState(existingReview?.strengths ?? "");
  const [areasForImprovement, setAreasForImprovement] = useState(
    existingReview?.areasForImprovement ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFinal = existingReview?.status === "selesai";

  async function saveDraft(): Promise<string | null> {
    const res = await fetch("/api/performance/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, cycle, scores, strengths, areasForImprovement }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? "Gagal menyimpan draft.");
      return null;
    }
    return data.review.id as string;
  }

  async function handleSaveDraft() {
    setError(null);
    setIsSaving(true);
    try {
      const id = await saveDraft();
      if (id) router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmitFinal() {
    setError(null);
    setIsSubmitting(true);
    try {
      const id = await saveDraft();
      if (!id) return;

      const res = await fetch(`/api/performance/reviews/${id}/submit`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal submit review.");
        return;
      }
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isFinal) {
    return (
      <div className="flex items-start gap-2.5 rounded-[10px] bg-surface-muted border border-border px-4 py-3.5 text-sm text-muted-foreground">
        <Lock className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
        <span>
          Review untuk siklus ini sudah final dan tidak bisa diedit lagi. Skor akhir:{" "}
          <span className="font-mono font-medium text-foreground">
            {(
              COMPETENCIES.reduce((sum, c) => sum + scores[c], 0) / COMPETENCIES.length
            ).toFixed(1)}
            /5
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COMPETENCIES.map((c) => (
          <div key={c} className="space-y-1.5">
            <label htmlFor={`score-${c}`} className="text-sm font-medium">
              {COMPETENCY_LABEL[c]}
            </label>
            <select
              id={`score-${c}`}
              value={scores[c]}
              onChange={(e) => setScores((prev) => ({ ...prev, [c]: Number(e.target.value) }))}
              className="w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {SCORE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v} {v === 1 ? "(Kurang)" : v === 5 ? "(Sangat Baik)" : ""}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="strengths" className="text-sm font-medium">
          Kekuatan
        </label>
        <textarea
          id="strengths"
          rows={2}
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
          placeholder="Apa yang sudah dilakukan dengan baik..."
          className="w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="improvement" className="text-sm font-medium">
          Area Pengembangan
        </label>
        <textarea
          id="improvement"
          rows={2}
          value={areasForImprovement}
          onChange={(e) => setAreasForImprovement(e.target.value)}
          placeholder="Apa yang perlu ditingkatkan..."
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

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isSaving || isSubmitting}
          className="flex items-center gap-2 rounded-[10px] border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-surface-muted transition-colors disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <Save className="h-4 w-4" strokeWidth={1.75} />
          )}
          Simpan Draft
        </button>
        <button
          type="button"
          onClick={handleSubmitFinal}
          disabled={isSaving || isSubmitting}
          className="flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <Send className="h-4 w-4" strokeWidth={1.75} />
          )}
          Submit Final
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Submit Final akan mengunci review ini — karyawan baru bisa melihatnya setelah di-submit,
        dan tidak bisa diedit lagi setelahnya.
      </p>
    </div>
  );
}
