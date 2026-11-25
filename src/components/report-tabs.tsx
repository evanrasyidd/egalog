"use client";

import { useEffect, useState } from "react";
import { Loader2, Download } from "lucide-react";
import { Card } from "./card";
import { todayISO } from "@/lib/date";

type Tab = "karyawan" | "absensi" | "payroll" | "cuti";

const TABS: { key: Tab; label: string }[] = [
  { key: "karyawan", label: "Data Karyawan" },
  { key: "absensi", label: "Absensi" },
  { key: "payroll", label: "Payroll" },
  { key: "cuti", label: "Cuti" },
];

const API_PATHS: Record<Tab, string> = {
  karyawan: "/api/admin/reports/employees",
  absensi: "/api/admin/reports/attendance",
  payroll: "/api/admin/reports/payroll",
  cuti: "/api/admin/reports/leave",
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);
}

const CURRENCY_COLS = new Set(["netPay", "baseSalary", "transport", "meal", "position", "overtime", "bpjs", "tax", "latePenalty", "alphaPenalty", "totalNetPay", "totalBaseSalary"]);

const COL_LABELS: Record<string, string> = {
  nip: "NIP", name: "Nama", email: "Email", role: "Role",
  department: "Departemen", jobTitle: "Jabatan", status: "Status",
  joinedAt: "Masuk", date: "Tanggal", clockIn: "Masuk", clockOut: "Pulang",
  note: "Keterangan", type: "Tipe", startDate: "Mulai", endDate: "Selesai",
  reason: "Alasan", createdAt: "Diajukan", netPay: "Take Home",
  baseSalary: "Gaji Pokok", transport: "Tunj. Transport", meal: "Tunj. Makan",
  position: "Tunj. Jabatan", overtime: "Lembur", bpjs: "BPJS", tax: "PPh21",
  latePenalty: "Denda Telat", alphaPenalty: "Denda Alpha", period: "Periode",
};

const SUMMARY_LABELS: Record<string, string> = {
  total: "Total Baris",
  active: "Aktif",
  inactive: "Nonaktif",
  totalNetPay: "Total Take Home",
  totalBaseSalary: "Total Gaji Pokok",
  periods: "Periode",
};

function firstOfMonth() {
  return `${todayISO().slice(0, 7)}-01`;
}

export function ReportTabs({ canViewPayroll = true }: { canViewPayroll?: boolean }) {
  const visibleTabs = canViewPayroll ? TABS : TABS.filter((t) => t.key !== "payroll");
  const [tab, setTab] = useState<Tab>("karyawan");
  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(todayISO);
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (tab === "absensi" || tab === "payroll" || tab === "cuti") {
      params.set("dateFrom", dateFrom);
      params.set("dateTo", dateTo);
    }
    const url = `${API_PATHS[tab]}${params.toString() ? "?" + params.toString() : ""}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data");
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setData(json.data);
        const summaryData: Record<string, unknown> = { ...json };
        delete summaryData.data;
        setSummary(summaryData);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Gagal memuat data.");
        setData(null);
        setSummary(null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab, dateFrom, dateTo, refreshKey]);

  function getCsvUrl(): string {
    switch (tab) {
      case "karyawan": return "/api/reports/employees";
      case "absensi": return `/api/reports/attendance?dateFrom=${dateFrom}&dateTo=${dateTo}`;
      case "payroll": return `/api/reports/payroll?dateFrom=${dateFrom}&dateTo=${dateTo}`;
      case "cuti": return `/api/reports/leave?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    }
  }

  function renderTable() {
    if (!data || data.length === 0) {
      return <p className="text-sm text-muted-foreground py-8 text-center">Tidak ada data.</p>;
    }

    const columns = Object.keys(data[0]);
    const displayData = data.slice(0, 50);

    return (
      <div
        className="overflow-x-auto max-h-96 overflow-y-auto border border-border rounded-[8px]"
        role="region"
        aria-label={`Tabel preview ${TABS.find((t) => t.key === tab)?.label}`}
        tabIndex={0}
      >
        <table className="w-full text-xs" aria-label={`Preview data ${TABS.find((t) => t.key === tab)?.label}`}>
          <thead className="sticky top-0 bg-surface z-10">
            <tr className="text-left border-b border-border">
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 font-medium whitespace-nowrap">
                  {COL_LABELS[col] ?? col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayData.map((row, i) => (
              <tr key={i} className="hover:bg-surface-muted">
                {columns.map((col) => {
                  const val = (row as Record<string, unknown>)[col];
                  return (
                    <td key={col} className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                      {typeof val === "number" && CURRENCY_COLS.has(col)
                        ? formatCurrency(val)
                        : String(val ?? "-")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 50 && (
          <p className="text-xs text-center text-muted-foreground py-2 border-t border-border">
            Menampilkan 50 dari {data.length} baris
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1 border-b border-border pb-1">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setLoading(true);
              setTab(t.key);
            }}
            aria-pressed={tab === t.key}
            className={`px-4 py-2 text-sm font-medium rounded-[8px] transition-colors ${
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-surface-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {(tab === "absensi" || tab === "payroll" || tab === "cuti") && (
          <>
            <div>
              <label htmlFor="dateFrom" className="text-xs font-medium mb-1 block text-muted-foreground">Dari Tanggal</label>
              <input
                id="dateFrom" type="date" value={dateFrom}
                onChange={(e) => {
                  setLoading(true);
                  setDateFrom(e.target.value);
                }}
                className="rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="text-xs font-medium mb-1 block text-muted-foreground">Sampai Tanggal</label>
              <input
                id="dateTo" type="date" value={dateTo}
                onChange={(e) => {
                  setLoading(true);
                  setDateTo(e.target.value);
                }}
                className="rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setRefreshKey((key) => key + 1);
              }}
              className="rounded-[8px] bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary-soft transition-colors"
            >
              Tampilkan
            </button>
          </>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(summary).filter(([k]) => k !== "data" && k !== "periods").map(([key, val]) => (
            <Card key={key}>
              <p className="text-xs text-muted-foreground mb-0.5">
                {SUMMARY_LABELS[key] ?? key}
              </p>
              <p className="text-lg font-semibold font-mono">
                {typeof val === "number" && CURRENCY_COLS.has(key)
                  ? formatCurrency(val)
                  : String(val)}
              </p>
            </Card>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" strokeWidth={1.75} />
        </div>
      ) : error ? (
        <p className="text-sm text-danger py-4 text-center">{error}</p>
      ) : (
        renderTable()
      )}

      {data && data.length > 0 && (
        <div className="flex justify-end">
          <a
            href={getCsvUrl()}
            className="inline-flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors"
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
            Download CSV
          </a>
        </div>
      )}
    </div>
  );
}
