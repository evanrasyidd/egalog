"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TriangleAlert, Send } from "lucide-react";
import { useToast } from "@/components/toast-provider";

const TYPE_OPTIONS = [
  { value: "cuti_tahunan", label: "Cuti Tahunan" },
  { value: "sakit", label: "Sakit" },
  { value: "izin", label: "Izin" },
] as const;

export function LeaveForm() {
  const router = useRouter();
  const showToast = useToast();
  const [type, setType] = useState<(typeof TYPE_OPTIONS)[number]["value"]>("cuti_tahunan");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/cuti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, startDate, endDate, reason }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Gagal mengajukan cuti.");
        showToast(data.message ?? "Gagal mengajukan cuti.", "error");
        setIsSubmitting(false);
        return;
      }

      setStartDate("");
      setEndDate("");
      setReason("");
      showToast("Pengajuan cuti/izin berhasil dikirim.");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      showToast("Gagal mengajukan cuti — cek koneksi kamu.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="type" className="text-sm font-medium">
          Jenis Pengajuan
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="startDate" className="text-sm font-medium">
            Tanggal Mulai
          </label>
          <input
            id="startDate"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="endDate" className="text-sm font-medium">
            Tanggal Selesai
          </label>
          <input
            id="endDate"
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reason" className="text-sm font-medium">
          Alasan
        </label>
        <textarea
          id="reason"
          required
          minLength={5}
          maxLength={500}
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Jelaskan alasan pengajuan..."
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
        className="flex items-center justify-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <Send className="h-4 w-4" strokeWidth={1.75} />
        )}
        Ajukan
      </button>
    </form>
  );
}
