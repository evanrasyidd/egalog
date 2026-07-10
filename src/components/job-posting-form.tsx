"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, TriangleAlert } from "lucide-react";
import type { Department, EmploymentType } from "@/lib/types";
import { DEPARTMENT_LABEL } from "@/lib/types";

const EMPLOYMENT_TYPE_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "full_time", label: "Full-time" },
  { value: "kontrak", label: "Kontrak" },
  { value: "magang", label: "Magang" },
];

const DEPARTMENT_OPTIONS = Object.entries(DEPARTMENT_LABEL) as [Department, string][];

export function JobPostingForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState<Department>("operasional");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("full_time");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/rekrutmen/lowongan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, department, employmentType, description, requirements }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal membuat lowongan.");
        return;
      }
      setTitle("");
      setDescription("");
      setRequirements("");
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
        <Plus className="h-4 w-4" strokeWidth={1.75} />
        Buat Lowongan Baru
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[10px] border border-border bg-surface p-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="job-title" className="text-sm font-medium">
            Judul Posisi
          </label>
          <input
            id="job-title"
            type="text"
            required
            minLength={3}
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="job-type" className="text-sm font-medium">
            Tipe
          </label>
          <select
            id="job-type"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
            className="w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="job-department" className="text-sm font-medium">
          Departemen
        </label>
        <select
          id="job-department"
          value={department}
          onChange={(e) => setDepartment(e.target.value as Department)}
          className="w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          {DEPARTMENT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="job-description" className="text-sm font-medium">
          Deskripsi Pekerjaan
        </label>
        <textarea
          id="job-description"
          required
          minLength={10}
          maxLength={2000}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="job-requirements" className="text-sm font-medium">
          Kualifikasi
        </label>
        <textarea
          id="job-requirements"
          required
          minLength={10}
          maxLength={2000}
          rows={3}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
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
            <Plus className="h-4 w-4" strokeWidth={1.75} />
          )}
          Publikasikan
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
