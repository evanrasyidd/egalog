import "server-only";
import { employees, attendanceRecords, leaveRequests, payslips, getSubordinateIds } from "./db";
import { canViewAllEmployees } from "./permissions";
import type { Employee } from "./types";

function escapeCsv(val: string | number): string {
  let s = String(val ?? "");
  // CSV injection: sel yang diawali =, +, -, @ bisa dieksekusi spreadsheet.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
}

function filterByDateRange<T extends { date?: string; createdAt?: string; startDate?: string; period?: string }>(
  records: T[],
  dateFrom?: string | null,
  dateTo?: string | null,
  dateKey: "date" | "createdAt" | "startDate" | "period" = "date",
): T[] {
  if (!dateFrom && !dateTo) return records;
  return records.filter((r) => {
    const d = r[dateKey];
    if (!d) return false;
    const dateStr = dateKey === "period" ? d : d.slice(0, 10);
    if (dateFrom && dateTo) return dateStr >= dateFrom && dateStr <= dateTo;
    if (dateFrom) return dateStr >= dateFrom;
    if (dateTo) return dateStr <= dateTo;
    return true;
  });
}

/** Employee IDs yang boleh dilihat oleh `actor`. */
export function getReportScope(actor: { type: "employee"; employee: Employee } | { type: "admin" }): Set<string> | null {
  if (actor.type === "admin") return null;
  // Owner, Direktur, dan Manager HR melihat seluruh perusahaan; manager lain
  // hanya lingkup garis komandonya.
  if (canViewAllEmployees(actor.employee)) return null;
  const ids = getSubordinateIds(actor.employee.id);
  ids.add(actor.employee.id);
  return ids;
}

export function exportEmployeesCsv(scopeIds?: Set<string> | null): string {
  const rows: string[][] = [];
  rows.push(["NIP", "Nama", "Email", "Role", "Departemen", "Jabatan", "Status", "Tanggal Masuk"]);
  const filtered = scopeIds ? employees.filter((e) => scopeIds.has(e.id)) : employees;
  for (const e of filtered) {
    rows.push([
      e.nip, e.name, e.email, e.role, e.department,
      e.jobTitle, e.isActive ? "Aktif" : "Nonaktif", e.joinedAt,
    ]);
  }
  return toCsv(rows);
}

export function exportAttendanceCsv(scopeIds?: Set<string> | null, period?: string, dateFrom?: string, dateTo?: string): string {
  const rows: string[][] = [];
  rows.push(["NIP", "Nama", "Tanggal", "Jam Masuk", "Jam Pulang", "Status", "Keterangan"]);
  let records = period
    ? attendanceRecords.filter((r) => r.date.startsWith(period))
    : attendanceRecords;
  if (scopeIds) records = records.filter((r) => scopeIds.has(r.employeeId));
  records = filterByDateRange(records, dateFrom, dateTo, "date");
  for (const r of records) {
    const emp = employees.find((e) => e.id === r.employeeId);
    rows.push([
      emp?.nip ?? r.employeeId, emp?.name ?? r.employeeId,
      r.date, r.clockIn ?? "-", r.clockOut ?? "-",
      r.status, r.note ?? "",
    ]);
  }
  return toCsv(rows);
}

export function exportPayrollCsv(scopeIds?: Set<string> | null, period?: string, dateFrom?: string, dateTo?: string): string {
  const rows: string[][] = [];
  rows.push([
    "NIP", "Nama", "Gaji Pokok", "Tunj. Transport", "Tunj. Makan",
    "Tunj. Jabatan", "Lembur", "BPJS", "PPh21", "Denda Telat",
    "Denda Alpha", "Take Home Pay", "Periode",
  ]);
  let filtered = period ? payslips.filter((p) => p.period === period) : payslips;
  if (scopeIds) filtered = filtered.filter((p) => scopeIds.has(p.employeeId));
  if (dateFrom && dateTo) {
    filtered = filtered.filter((p) => p.period >= dateFrom.slice(0, 7) && p.period <= dateTo.slice(0, 7));
  }
  for (const p of filtered) {
    const emp = employees.find((e) => e.id === p.employeeId);
    rows.push([
      emp?.nip ?? p.employeeId, emp?.name ?? p.employeeId,
      String(p.earnings.baseSalary), String(p.earnings.allowanceTransport),
      String(p.earnings.allowanceMeal), String(p.earnings.allowancePosition),
      String(p.earnings.overtimePay), String(p.deductions.bpjs),
      String(p.deductions.incomeTax), String(p.deductions.latePenalty),
      String(p.deductions.absencePenalty), String(p.netPay), p.period,
    ]);
  }
  return toCsv(rows);
}

export function exportLeaveCsv(scopeIds?: Set<string> | null, period?: string, dateFrom?: string, dateTo?: string): string {
  const rows: string[][] = [];
  rows.push(["NIP", "Nama", "Tipe", "Mulai", "Selesai", "Alasan", "Status", "Diajukan"]);
  let filtered = period
    ? leaveRequests.filter((r) => r.createdAt.startsWith(period))
    : leaveRequests;
  if (scopeIds) filtered = filtered.filter((r) => scopeIds.has(r.employeeId));
  filtered = filterByDateRange(filtered, dateFrom, dateTo, "createdAt");
  for (const r of filtered) {
    const emp = employees.find((e) => e.id === r.employeeId);
    rows.push([
      emp?.nip ?? r.employeeId, emp?.name ?? r.employeeId,
      r.type, r.startDate, r.endDate, r.reason, r.status, r.createdAt,
    ]);
  }
  return toCsv(rows);
}
