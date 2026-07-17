"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play, Download, TriangleAlert, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/toast-provider";

interface EmployeeRow {
  id: string;
  name: string;
  jobTitle: string;
  nip: string;
  payslipId: string | null;
  netPay: number | null;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PayrollManager({
  initialPeriod,
  rows,
}: {
  initialPeriod: string;
  rows: EmployeeRow[];
}) {
  const router = useRouter();
  const showToast = useToast();
  const [period, setPeriod] = useState(initialPeriod);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function changePeriod(newPeriod: string) {
    setPeriod(newPeriod);
    router.push(`/payroll/kelola?period=${newPeriod}`);
  }

  async function handleBulkGenerate() {
    setError(null);
    setSuccessMessage(null);
    setIsBulkLoading(true);
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "all", period }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal generate payroll.");
        return;
      }
      setSuccessMessage(
        `Berhasil generate ${data.summary.generated} slip baru (${data.summary.skippedExisting} sudah ada sebelumnya).`,
      );
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setIsBulkLoading(false);
    }
  }

  async function handleSingleGenerate(employeeId: string) {
    setError(null);
    setSuccessMessage(null);
    setLoadingRowId(employeeId);
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "single", employeeId, period }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal generate slip.");
        showToast(data.message ?? "Gagal generate slip.", "error");
        return;
      }
      showToast("Slip gaji berhasil dibuat.");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      showToast("Gagal generate slip — cek koneksi kamu.", "error");
    } finally {
      setLoadingRowId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <label htmlFor="period" className="text-sm font-medium">
            Periode
          </label>
          <input
            id="period"
            type="month"
            value={period}
            onChange={(e) => changePeriod(e.target.value)}
            className="rounded-[10px] border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="button"
          onClick={handleBulkGenerate}
          disabled={isBulkLoading}
          className="flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-60"
        >
          {isBulkLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <Play className="h-4 w-4" strokeWidth={1.75} />
          )}
          Generate Semua Karyawan
        </button>
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
      {successMessage && (
        <div className="flex items-start gap-2 rounded-[10px] bg-success/10 border border-success/25 px-3.5 py-2.5 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="pb-2 font-medium">Karyawan</th>
              <th className="pb-2 font-medium">NIP</th>
              <th className="pb-2 font-medium">Gaji Bersih</th>
              <th className="pb-2 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="py-2.5">
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-muted-foreground">{row.jobTitle}</p>
                </td>
                <td className="py-2.5 font-mono text-muted-foreground">{row.nip}</td>
                <td className="py-2.5 font-mono">
                  {row.netPay !== null ? formatCurrency(row.netPay) : "—"}
                </td>
                <td className="py-2.5">
                  {row.payslipId ? (
                    <a
                      href={`/api/payroll/${row.payslipId}/pdf`}
                      className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-surface px-2.5 py-1 text-xs font-medium hover:bg-surface-muted transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                      PDF
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSingleGenerate(row.id)}
                      disabled={loadingRowId === row.id}
                      className="inline-flex items-center gap-1.5 rounded-[8px] bg-primary text-primary-foreground px-2.5 py-1 text-xs font-medium hover:bg-primary-soft transition-colors disabled:opacity-60"
                    >
                      {loadingRowId === row.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                      ) : (
                        <Play className="h-3.5 w-3.5" strokeWidth={1.75} />
                      )}
                      Generate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
