"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, TriangleAlert } from "lucide-react";

export function AddCandidateForm({ jobPostingId }: { jobPostingId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resumeNote, setResumeNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rekrutmen/lowongan/${jobPostingId}/kandidat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, resumeNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal menambah kandidat.");
        return;
      }
      setName("");
      setEmail("");
      setPhone("");
      setResumeNote("");
      setIsOpen(false);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors"
      >
        <UserPlus className="h-4 w-4" strokeWidth={1.75} />
        Tambah Kandidat
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[10px] border border-border bg-surface p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="cand-name" className="text-sm font-medium">
            Nama
          </label>
          <input
            id="cand-name"
            type="text"
            required
            minLength={2}
            maxLength={150}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="cand-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="cand-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="cand-phone" className="text-sm font-medium">
          No. HP
        </label>
        <input
          id="cand-phone"
          type="tel"
          required
          minLength={6}
          maxLength={30}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0812xxxxxxx"
          className="w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="cand-resume" className="text-sm font-medium">
          Ringkasan CV / Pengalaman
        </label>
        <textarea
          id="cand-resume"
          rows={2}
          maxLength={2000}
          value={resumeNote}
          onChange={(e) => setResumeNote(e.target.value)}
          className="w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
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
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <UserPlus className="h-4 w-4" strokeWidth={1.75} />
          )}
          Simpan
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-[10px] border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-surface-muted transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
