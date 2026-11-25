"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Download,
  Loader2,
  Play,
  Search,
  TriangleAlert,
} from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DEPARTMENT_LABEL, type Department } from "@/lib/types";
import { currentPeriod } from "@/lib/date";

interface EmployeeRow {
  id: string;
  name: string;
  jobTitle: string;
  nip: string;
  department: Department;
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

type StatusFilter = "semua" | "belum" | "sudah";

export function PayrollManager({
  initialPeriod,
  rows,
  canGenerate,
}: {
  initialPeriod: string;
  rows: EmployeeRow[];
  canGenerate: boolean;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [period, setPeriod] = useState(initialPeriod);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState<Department | "semua">("semua");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (department !== "semua" && row.department !== department) return false;
      if (statusFilter === "belum" && row.payslipId) return false;
      if (statusFilter === "sudah" && !row.payslipId) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.nip.toLowerCase().includes(q) ||
        row.jobTitle.toLowerCase().includes(q)
      );
    });
  }, [rows, query, department, statusFilter]);

  const generatedCount = rows.filter((r) => r.payslipId).length;
  const totalNetPay = rows.reduce((sum, r) => sum + (r.netPay ?? 0), 0);
  const pendingCount = rows.length - generatedCount;

  const groupedRows = useMemo(() => {
    const groups = new Map<Department, EmployeeRow[]>();
    for (const row of filteredRows) {
      const list = groups.get(row.department) ?? [];
      list.push(row);
      groups.set(row.department, list);
    }
    return [...groups.entries()].sort(([a], [b]) =>
      DEPARTMENT_LABEL[a].localeCompare(DEPARTMENT_LABEL[b]),
    );
  }, [filteredRows]);

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
      const summary = data.summary;
      setSuccessMessage(
        `Berhasil generate ${summary.generated} slip. ${summary.skippedExisting} sudah ada, ${summary.skippedNoData} dilewati karena data absensi belum lengkap.`,
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
    <div className="space-y-5">
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
            max={currentPeriod()}
            className="rounded-[10px] border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowBulkConfirm(true)}
          disabled={isBulkLoading || !canGenerate || rows.length === 0}
          className="flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBulkLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <Play className="h-4 w-4" strokeWidth={1.75} />
          )}
          Generate Semua Karyawan
        </button>
      </div>

      {!canGenerate && (
        <div className="flex items-start gap-2 rounded-[10px] bg-warning/10 border border-warning/30 px-3.5 py-2.5 text-sm text-warning">
          <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
          <span>
            Periode ini belum selesai. Payroll baru bisa difinalkan setelah
            tanggal terakhir periode — pilih bulan lalu untuk generate.
          </span>
        </div>
      )}

      <ConfirmDialog
        open={showBulkConfirm}
        title="Generate payroll semua karyawan?"
        message={`Payroll periode ${period} akan digenerate untuk ${rows.length} karyawan aktif. Karyawan yang sudah punya slip atau belum punya data absensi akan dilewati.`}
        confirmLabel="Ya, generate"
        variant="warning"
        onConfirm={() => {
          setShowBulkConfirm(false);
          handleBulkGenerate();
        }}
        onCancel={() => setShowBulkConfirm(false)}
      />

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-[10px] border border-border bg-surface-muted/40 p-3.5">
          <p className="text-xs text-muted-foreground">Karyawan aktif</p>
          <p className="text-xl font-semibold font-mono mt-0.5">{rows.length}</p>
        </div>
        <div className="rounded-[10px] border border-border bg-surface-muted/40 p-3.5">
          <p className="text-xs text-muted-foreground">Sudah digenerate</p>
          <p className="text-xl font-semibold font-mono mt-0.5 text-success">
            {generatedCount}
          </p>
        </div>
        <div className="rounded-[10px] border border-border bg-surface-muted/40 p-3.5">
          <p className="text-xs text-muted-foreground">Total take home</p>
          <p className="text-xl font-semibold font-mono mt-0.5">
            {formatCurrency(totalNetPay)}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama, NIP, atau jabatan..."
            aria-label="Cari karyawan"
            className="w-full rounded-[10px] border border-border bg-surface pl-9 pr-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value as Department | "semua")}
          aria-label="Filter departemen"
          className="rounded-[10px] border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="semua">Semua departemen</option>
          {Object.entries(DEPARTMENT_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          aria-label="Filter status payroll"
          className="rounded-[10px] border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="semua">Semua status</option>
          <option value="belum">Belum digenerate ({pendingCount})</option>
          <option value="sudah">Sudah digenerate ({generatedCount})</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Tidak ada karyawan aktif.
        </p>
      ) : filteredRows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Tidak ada karyawan yang cocok dengan filter.
        </p>
      ) : (
        <div className="border border-border rounded-[10px] overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_130px_150px] gap-3 px-4 py-2.5 bg-surface-muted/60 text-xs font-medium text-muted-foreground">
            <span>Karyawan</span>
            <span>Gaji bersih</span>
            <span className="text-right">Aksi</span>
          </div>

          {groupedRows.map(([dept, deptRows]) => (
            <div key={dept}>
              <div className="flex items-center justify-between gap-3 px-4 py-2 bg-surface-muted/40 border-y border-border">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {DEPARTMENT_LABEL[dept]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {deptRows.length} karyawan
                </p>
              </div>

              <div className="divide-y divide-border">
                {deptRows.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_130px_150px] gap-2 sm:gap-3 px-4 py-3 items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{row.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {row.jobTitle} · <span className="font-mono">{row.nip}</span>
                      </p>
                    </div>
                    <div className="font-mono text-sm">
                      {row.netPay !== null ? (
                        formatCurrency(row.netPay)
                      ) : (
                        <span className="text-muted-foreground">Belum ada</span>
                      )}
                    </div>
                    <div className="sm:text-right">
                      {row.payslipId ? (
                        <a
                          href={`/api/payroll/${row.payslipId}/pdf`}
                          className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-surface px-2.5 py-1.5 text-xs font-medium hover:bg-surface-muted transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Unduh PDF
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSingleGenerate(row.id)}
                          disabled={loadingRowId === row.id || !canGenerate}
                          className="inline-flex items-center gap-1.5 rounded-[8px] bg-primary text-primary-foreground px-2.5 py-1.5 text-xs font-medium hover:bg-primary-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingRowId === row.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                          ) : (
                            <Play className="h-3.5 w-3.5" strokeWidth={1.75} />
                          )}
                          Generate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
