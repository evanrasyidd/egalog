"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import type { CandidateStage } from "@/lib/types";

const STAGE_OPTIONS: { value: CandidateStage; label: string }[] = [
  { value: "lamar", label: "Lamar" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "diterima", label: "Diterima" },
  { value: "ditolak", label: "Ditolak" },
];

export function CandidateStageEditor({
  candidateId,
  currentStage,
  currentNotes,
}: {
  candidateId: string;
  currentStage: CandidateStage;
  currentNotes: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState(currentStage);
  const [notes, setNotes] = useState(currentNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = stage !== currentStage || notes !== currentNotes;

  async function handleSave() {
    setError(null);
    setIsSaving(true);
    try {
      const res = await fetch(`/api/rekrutmen/kandidat/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal menyimpan.");
        return;
      }
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value as CandidateStage)}
          className="rounded-[8px] border border-border bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          {STAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {isDirty && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-primary text-primary-foreground px-2.5 py-1.5 text-xs font-medium hover:bg-primary-soft transition-colors disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
            ) : (
              <Save className="h-3 w-3" strokeWidth={1.75} />
            )}
            Simpan
          </button>
        )}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        maxLength={2000}
        placeholder="Catatan interview/HR..."
        className="w-full rounded-[8px] border border-border bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
