"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/toast-provider";
import type { Holiday } from "@/lib/types";

export function HolidayManager({ initialHolidays }: { initialHolidays: Holiday[] }) {
  const router = useRouter();
  const showToast = useToast();
  const [holidays, setHolidays] = useState(initialHolidays);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [isNational, setIsNational] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !name.trim()) {
      showToast("Tanggal dan nama harus diisi.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, name: name.trim(), isNational }),
      });
      if (!res.ok) {
        const d = await res.json();
        showToast(d.message ?? "Gagal menambah hari libur.", "error");
        return;
      }
      const d = await res.json();
      setHolidays((prev) => [...prev, d.holiday].sort((a, b) => a.date.localeCompare(b.date)));
      setDate("");
      setName("");
      showToast("Hari libur berhasil ditambahkan.");
      router.refresh();
    } catch {
      showToast("Gagal menambah hari libur.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(hdate: string, hname: string) {
    if (!confirm(`Hapus "${hname}" (${hdate})?`)) return;
    try {
      const res = await fetch(`/api/admin/holidays/${hdate}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Gagal menghapus hari libur.", "error");
        return;
      }
      setHolidays((prev) => prev.filter((h) => h.date !== hdate));
      showToast("Hari libur berhasil dihapus.");
      router.refresh();
    } catch {
      showToast("Gagal menghapus hari libur.", "error");
    }
  }

  const groupedByMonth: Record<string, typeof holidays> = {};
  for (const h of holidays) {
    const month = h.date.slice(0, 7);
    if (!groupedByMonth[month]) groupedByMonth[month] = [];
    groupedByMonth[month].push(h);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <CardShell>
        <h2 className="text-sm font-medium mb-4">Tambah Hari Libur</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label htmlFor="hl-date" className="text-sm font-medium mb-1 block">Tanggal</label>
            <input
              id="hl-date" type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="hl-name" className="text-sm font-medium mb-1 block">Nama Hari Libur</label>
            <input
              id="hl-name" type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Nama hari libur"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="hl-national" type="checkbox" checked={isNational}
              onChange={(e) => setIsNational(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="hl-national" className="text-sm">Libur Nasional</label>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-[10px] bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" strokeWidth={1.75} />}
            Tambah
          </button>
        </form>
      </CardShell>

      <div className="lg:col-span-2 space-y-4">
        {Object.entries(groupedByMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, mHolidays]) => {
          const [y, m] = month.split("-").map(Number);
          const monthName = new Date(y, m - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
          return (
            <CardShell key={month}>
              <h3 className="text-sm font-medium mb-3">{monthName}</h3>
              <div className="space-y-2">
                {mHolidays.map((h) => (
                  <div key={h.date} className="flex items-center justify-between rounded-[8px] border border-border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{h.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {new Date(h.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        <span className={`ml-2 ${h.isNational ? "text-success" : "text-warning"}`}>
                          {h.isNational ? "Nasional" : "Cuti Bersama"}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(h.date, h.name)}
                      className="h-8 w-8 flex items-center justify-center rounded-[8px] text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
                      aria-label={`Hapus ${h.name}`}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                ))}
              </div>
            </CardShell>
          );
        })}
      </div>
    </div>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[10px] border border-border bg-surface p-4 sm:p-5">{children}</div>;
}
