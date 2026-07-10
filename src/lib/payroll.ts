import "server-only";
import { attendanceRecords, leaveRequests, payslips, findEmployeeById, nextPayslipId } from "./db";
import {
  DAILY_TRANSPORT_ALLOWANCE,
  DAILY_MEAL_ALLOWANCE,
  POSITION_ALLOWANCE_BY_ROLE,
  LATE_PENALTY_PER_DAY,
  BPJS_RATE,
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

function getDaysInPeriod(period: string): string[] {
  const [year, month] = period.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const dates: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(`${period}-${String(day).padStart(2, "0")}`);
  }
  return dates;
}

function isWeekday(dateStr: string): boolean {
  const day = new Date(`${dateStr}T00:00:00`).getDay();
  return day !== 0 && day !== 6; // 0 = Minggu, 6 = Sabtu
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
}

/**
 * Menghitung ringkasan absensi 1 periode untuk 1 karyawan, silang-cek dengan
 * cuti yang sudah disetujui (hari kerja yang ditutup cuti TIDAK dianggap alpha).
 */
function computeAttendance(employeeId: string, period: string): AttendanceComputation {
  const workdays = getDaysInPeriod(period).filter(isWeekday);
  let presentDays = 0;
  let lateDays = 0;
  let leaveDays = 0;
  let alphaDays = 0;
  let totalOvertimeHours = 0;

  for (const date of workdays) {
    const record = attendanceRecords.find(
      (r) => r.employeeId === employeeId && r.date === date,
    );

    if (record?.clockIn) {
      presentDays += 1;
      if (record.status === "terlambat") lateDays += 1;

      if (record.clockIn && record.clockOut) {
        const hoursWorked =
          (new Date(record.clockOut).getTime() - new Date(record.clockIn).getTime()) /
          (1000 * 60 * 60);
        const overtime = Math.max(0, hoursWorked - STANDARD_WORK_HOURS_PER_DAY);
        totalOvertimeHours += Math.min(overtime, MAX_OVERTIME_HOURS_PER_DAY);
      }
      continue;
    }

    if (isCoveredByApprovedLeave(employeeId, date)) {
      leaveDays += 1;
      continue;
    }

    alphaDays += 1;
  }

  return {
    summary: {
      workingDays: workdays.length,
      presentDays,
      lateDays,
      leaveDays,
      alphaDays,
    },
    totalOvertimeHours,
  };
}

export type GeneratePayslipResult =
  | { ok: true; payslip: Payslip }
  | { ok: false; error: "already_exists" | "employee_not_found" | "invalid_period" };

export function generatePayslip(
  employeeId: string,
  period: string,
  generatedBy: string,
): GeneratePayslipResult {
  if (!isValidPeriod(period)) return { ok: false, error: "invalid_period" };

  const employee = findEmployeeById(employeeId);
  if (!employee) return { ok: false, error: "employee_not_found" };

  const alreadyExists = payslips.some(
    (p) => p.employeeId === employeeId && p.period === period,
  );
  if (alreadyExists) return { ok: false, error: "already_exists" };

  const { summary, totalOvertimeHours } = computeAttendance(employeeId, period);

  const hourlyRate = employee.baseSalary / MONTHLY_HOURS_DIVISOR;
  const overtimePay = Math.round(hourlyRate * OVERTIME_MULTIPLIER * totalOvertimeHours);

  const allowanceTransport = summary.presentDays * DAILY_TRANSPORT_ALLOWANCE;
  const allowanceMeal = summary.presentDays * DAILY_MEAL_ALLOWANCE;
  const allowancePosition = POSITION_ALLOWANCE_BY_ROLE[employee.role];

  const grossPay =
    employee.baseSalary +
    allowanceTransport +
    allowanceMeal +
    allowancePosition +
    overtimePay;

  const bpjs = Math.round(employee.baseSalary * BPJS_RATE);
  const incomeTax = Math.round(estimateIncomeTax(grossPay));
  const latePenalty = summary.lateDays * LATE_PENALTY_PER_DAY;
  const dailyRate = employee.baseSalary / summary.workingDays;
  const absencePenalty = Math.round(summary.alphaDays * dailyRate);

  const totalDeductions = bpjs + incomeTax + latePenalty + absencePenalty;
  const netPay = grossPay - totalDeductions;

  const payslip: Payslip = {
    id: nextPayslipId(),
    employeeId,
    period,
    earnings: {
      baseSalary: employee.baseSalary,
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
  return { ok: true, payslip };
}

export interface BulkGenerateSummary {
  generated: number;
  skippedExisting: number;
  total: number;
}

export function generatePayslipsForAll(
  employees: Employee[],
  period: string,
  generatedBy: string,
): BulkGenerateSummary {
  let generated = 0;
  let skippedExisting = 0;

  for (const employee of employees) {
    const result = generatePayslip(employee.id, period, generatedBy);
    if (result.ok) generated += 1;
    else if (result.error === "already_exists") skippedExisting += 1;
  }

  return { generated, skippedExisting, total: employees.length };
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
