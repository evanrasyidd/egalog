import "server-only";
import {
  attendanceRecords,
  employees,
  leaveRequests,
  payslips,
  findEmployeeById,
  nextPayslipId,
  getWorkingDaysInPeriod,
} from "./db";
import { isPeriodClosed, periodEndDate, todayISO } from "./date";
import { createNotification } from "./notifications";
import { getSystemSettings } from "./settings";
import {
  POSITION_ALLOWANCE_BY_ROLE,
  estimateIncomeTax,
  STANDARD_WORK_HOURS_PER_DAY,
  MAX_OVERTIME_HOURS_PER_DAY,
  MONTHLY_HOURS_DIVISOR,
  OVERTIME_MULTIPLIER,
} from "./payroll-config";
import type { Payslip, PayslipAttendanceSummary, Employee } from "./types";

const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidPeriod(period: string): boolean {
  return PERIOD_REGEX.test(period);
}

function isCoveredByApprovedLeave(employeeId: string, dateStr: string): boolean {
  return leaveRequests.some(
    (r) =>
      r.employeeId === employeeId &&
      r.status === "disetujui" &&
      dateStr >= r.startDate &&
      dateStr <= r.endDate,
  );
}

interface AttendanceComputation {
  summary: PayslipAttendanceSummary;
  totalOvertimeHours: number;
  totalPeriodWorkdays: number;
  hasData: boolean;
}

/**
 * Menghitung ringkasan absensi 1 periode untuk 1 karyawan.
 *
 * Aturan penting:
 * - Hari libur nasional/cuti bersama BUKAN hari kerja (pakai kalender libur).
 * - Hari ini dan tanggal setelahnya tidak dihitung alpha; payroll bulan
 *   berjalan memang tidak boleh difinalkan (lihat isPeriodClosed).
 * - Karyawan yang baru bergabung di tengah periode hanya dihitung sejak
 *   tanggal bergabung.
 */
function computeAttendance(employee: Employee, period: string): AttendanceComputation {
  const allWorkdays = getWorkingDaysInPeriod(period);
  const today = todayISO();
  const joinedAt = employee.joinedAt.slice(0, 10);
  const workdays = allWorkdays.filter((date) => date < today && date >= joinedAt);

  let presentDays = 0;
  let lateDays = 0;
  let leaveDays = 0;
  let alphaDays = 0;
  let totalOvertimeHours = 0;

  for (const date of workdays) {
    const record = attendanceRecords.find(
      (r) => r.employeeId === employee.id && r.date === date,
    );

    if (record?.clockIn) {
      presentDays += 1;
      if (record.status === "terlambat") lateDays += 1;

      if (record.clockOut) {
        const hoursWorked =
          (new Date(record.clockOut).getTime() - new Date(record.clockIn).getTime()) /
          (1000 * 60 * 60);
        const overtime = Math.max(0, hoursWorked - STANDARD_WORK_HOURS_PER_DAY);
        totalOvertimeHours += Math.min(overtime, MAX_OVERTIME_HOURS_PER_DAY);
      }
      continue;
    }

    if (isCoveredByApprovedLeave(employee.id, date)) {
      leaveDays += 1;
      continue;
    }

    alphaDays += 1;
  }

  const periodStart = `${period}-01`;
  const periodEnd = periodEndDate(period);
  const hasAttendance = attendanceRecords.some(
    (r) => r.employeeId === employee.id && r.date >= periodStart && r.date <= periodEnd,
  );
  const hasApprovedLeave = leaveRequests.some(
    (r) =>
      r.employeeId === employee.id &&
      r.status === "disetujui" &&
      r.startDate <= periodEnd &&
      r.endDate >= periodStart,
  );

  return {
    summary: {
      workingDays: workdays.length,
      presentDays,
      lateDays,
      leaveDays,
      alphaDays,
    },
    totalOvertimeHours,
    totalPeriodWorkdays: allWorkdays.length,
    hasData: hasAttendance || hasApprovedLeave,
  };
}

export type GeneratePayslipError =
  | "already_exists"
  | "employee_not_found"
  | "invalid_period"
  | "period_not_closed"
  | "employee_inactive"
  | "attendance_missing"
  | "not_eligible";

export type GeneratePayslipResult =
  | { ok: true; payslip: Payslip }
  | { ok: false; error: GeneratePayslipError };

export function generatePayslip(
  employeeId: string,
  period: string,
  generatedBy: string,
): GeneratePayslipResult {
  if (!isValidPeriod(period)) return { ok: false, error: "invalid_period" };

  const employee = findEmployeeById(employeeId);
  if (!employee) return { ok: false, error: "employee_not_found" };
  if (!employee.isActive) return { ok: false, error: "employee_inactive" };

  // Finalisasi payroll hanya setelah periode selesai. Ini mencegah slip gaji
  // bulan berjalan menghitung sisa hari sebagai alpha.
  if (!isPeriodClosed(period)) return { ok: false, error: "period_not_closed" };

  const alreadyExists = payslips.some(
    (p) => p.employeeId === employeeId && p.period === period,
  );
  if (alreadyExists) return { ok: false, error: "already_exists" };

  const { summary, totalOvertimeHours, totalPeriodWorkdays, hasData } =
    computeAttendance(employee, period);

  if (summary.workingDays === 0) return { ok: false, error: "not_eligible" };
  if (!hasData) return { ok: false, error: "attendance_missing" };

  const settings = getSystemSettings();
  const proration = summary.workingDays / Math.max(1, totalPeriodWorkdays);
  const proratedBaseSalary = Math.round(employee.baseSalary * proration);
  const hourlyRate = proratedBaseSalary / MONTHLY_HOURS_DIVISOR;
  const overtimePay = Math.round(hourlyRate * OVERTIME_MULTIPLIER * totalOvertimeHours);

  const allowanceTransport = summary.presentDays * settings.dailyTransportAllowance;
  const allowanceMeal = summary.presentDays * settings.dailyMealAllowance;
  const allowancePosition = Math.round(
    POSITION_ALLOWANCE_BY_ROLE[employee.role] * proration,
  );

  const grossPay =
    proratedBaseSalary +
    allowanceTransport +
    allowanceMeal +
    allowancePosition +
    overtimePay;

  const bpjs = Math.round(proratedBaseSalary * settings.bpjsRate);
  const incomeTax = Math.round(estimateIncomeTax(grossPay));
  const latePenalty = summary.lateDays * settings.latePenaltyPerDay;
  const dailyRate = proratedBaseSalary / Math.max(1, summary.workingDays);
  const rawAbsencePenalty = Math.round(summary.alphaDays * dailyRate);

  // Potongan tidak boleh membuat take home pay negatif. Kalau absence lebih
  // besar dari sisa penghasilan, potong maksimal sampai net = 0.
  const maxAbsencePenalty = Math.max(0, grossPay - bpjs - incomeTax - latePenalty);
  const absencePenalty = Math.min(rawAbsencePenalty, maxAbsencePenalty);

  const totalDeductions = bpjs + incomeTax + latePenalty + absencePenalty;
  const netPay = Math.max(0, grossPay - totalDeductions);

  const payslip: Payslip = {
    id: nextPayslipId(),
    employeeId,
    period,
    earnings: {
      baseSalary: proratedBaseSalary,
      allowanceTransport,
      allowanceMeal,
      allowancePosition,
      overtimePay,
      overtimeHours: Math.round(totalOvertimeHours * 10) / 10,
    },
    deductions: { bpjs, incomeTax, latePenalty, absencePenalty },
    attendance: summary,
    grossPay,
    totalDeductions,
    netPay,
    generatedAt: new Date().toISOString(),
    generatedBy,
  };

  payslips.push(payslip);
  createNotification(
    "payroll_generated",
    employeeId,
    "Slip gaji sudah terbit",
    `Payroll periode ${period} sudah tersedia — total take home pay ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(netPay)}`,
    "/payroll",
  );
  return { ok: true, payslip };
}

export interface BulkGenerateSummary {
  generated: number;
  skippedExisting: number;
  skippedNoData: number;
  skippedInactive: number;
  total: number;
}

export function generatePayslipsForAll(
  period: string,
  generatedBy: string,
): BulkGenerateSummary {
  let generated = 0;
  let skippedExisting = 0;
  let skippedNoData = 0;
  let skippedInactive = 0;

  // Hanya karyawan aktif. Karyawan nonaktif tidak boleh mendapat slip baru;
  // final payroll untuk yang resign harus diproses manual oleh Finance.
  const targetEmployees: Employee[] = [];
  for (const employee of employees) {
    if (employee.isActive) targetEmployees.push(employee);
    else skippedInactive += 1;
  }

  for (const employee of targetEmployees) {
    const result = generatePayslip(employee.id, period, generatedBy);
    if (result.ok) generated += 1;
    else if (result.error === "already_exists") skippedExisting += 1;
    else if (result.error === "attendance_missing" || result.error === "not_eligible") {
      skippedNoData += 1;
    }
  }

  return {
    generated,
    skippedExisting,
    skippedNoData,
    skippedInactive,
    total: targetEmployees.length,
  };
}

export function getPayslipsForEmployee(employeeId: string): Payslip[] {
  return payslips
    .filter((p) => p.employeeId === employeeId)
    .sort((a, b) => b.period.localeCompare(a.period));
}

export function getPayslipsForPeriod(period: string): Payslip[] {
  return payslips.filter((p) => p.period === period);
}

export function findPayslipById(id: string): Payslip | undefined {
  return payslips.find((p) => p.id === id);
}
