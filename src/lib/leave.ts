import "server-only";
import { leaveRequests, holidays, findEmployeeById, nextLeaveId } from "./db";
import { countWorkingDaysInRange } from "./date";
import { buildApprovalChain, isCurrentApprover } from "./permissions";
import { createNotification } from "./notifications";
import type { LeaveRequest, LeaveType } from "./types";

/**
 * Cuti dihitung dalam HARI KERJA: Sabtu, Minggu, dan hari libur tidak
 * memotong saldo. Ini konsisten dengan perhitungan payroll yang juga memakai
 * kalender hari kerja.
 */
export function countLeaveDays(startDate: string, endDate: string): number {
  return countWorkingDaysInRange(
    startDate,
    endDate,
    holidays.map((h) => h.date),
  );
}

function hasOverlappingRequest(
  employeeId: string,
  startDate: string,
  endDate: string,
  excludeId?: string,
): boolean {
  return leaveRequests.some(
    (r) =>
      r.id !== excludeId &&
      r.employeeId === employeeId &&
      r.status !== "ditolak" &&
      r.startDate <= endDate &&
      r.endDate >= startDate,
  );
}

function pendingAnnualLeaveDays(employeeId: string): number {
  return leaveRequests
    .filter(
      (r) =>
        r.employeeId === employeeId &&
        r.type === "cuti_tahunan" &&
        r.status === "menunggu",
    )
    .reduce((total, r) => total + countLeaveDays(r.startDate, r.endDate), 0);
}

export type CreateLeaveResult =
  | { ok: true; request: LeaveRequest }
  | {
      ok: false;
      error:
        | "insufficient_balance"
        | "invalid_date_range"
        | "employee_not_found"
        | "overlapping_request"
        | "no_working_days";
    };

export function createLeaveRequest(
  employeeId: string,
  type: LeaveType,
  startDate: string,
  endDate: string,
  reason: string,
): CreateLeaveResult {
  const employee = findEmployeeById(employeeId);
  if (!employee) return { ok: false, error: "employee_not_found" };

  if (new Date(endDate) < new Date(startDate)) {
    return { ok: false, error: "invalid_date_range" };
  }

  if (hasOverlappingRequest(employeeId, startDate, endDate)) {
    return { ok: false, error: "overlapping_request" };
  }

  const days = countLeaveDays(startDate, endDate);
  if (days === 0) return { ok: false, error: "no_working_days" };

  if (type === "cuti_tahunan") {
    // Saldo sudah dipotong saat approval, jadi yang perlu dicek di sini adalah
    // saldo tersisa + pengajuan tahunan lain yang masih menunggu.
    const reserved = pendingAnnualLeaveDays(employeeId);
    if (days + reserved > employee.leaveBalance) {
      return { ok: false, error: "insufficient_balance" };
    }
  }

  const approvalChain = buildApprovalChain(employee);
  const request: LeaveRequest = {
    id: nextLeaveId(),
    employeeId,
    type,
    startDate,
    endDate,
    reason,
    status: approvalChain.length === 0 ? "disetujui" : "menunggu",
    createdAt: new Date().toISOString(),
    approvalChain,
    currentStepIndex: 0,
  };

  leaveRequests.push(request);

  // Notifikasi ke approver pertama (kalau ada)
  if (approvalChain.length > 0) {
    const firstApprover = approvalChain[0];
    createNotification(
      "leave_requested",
      firstApprover.approverId,
      `Pengajuan cuti baru dari ${employee.name}`,
      `${type === "cuti_tahunan" ? "Cuti Tahunan" : type === "sakit" ? "Sakit" : "Izin"} — ${startDate} s.d. ${endDate}`,
      "/cuti/approval",
    );
  }

  // Owner tidak punya atasan -> auto-disetujui, langsung potong saldo kalau cuti tahunan.
  if (approvalChain.length === 0 && type === "cuti_tahunan") {
    employee.leaveBalance -= days;
  }

  return { ok: true, request };
}

export type DecideLeaveResult =
  | { ok: true; request: LeaveRequest }
  | {
      ok: false;
      error:
        | "not_found"
        | "not_your_turn"
        | "already_decided"
        | "insufficient_balance";
    };

export function decideLeaveRequest(
  leaveId: string,
  approverId: string,
  decision: "disetujui" | "ditolak",
  comment?: string,
): DecideLeaveResult {
  const request = leaveRequests.find((r) => r.id === leaveId);
  if (!request) return { ok: false, error: "not_found" };

  if (request.status !== "menunggu") {
    return { ok: false, error: "already_decided" };
  }

  if (!isCurrentApprover(request.approvalChain, request.currentStepIndex, approverId)) {
    return { ok: false, error: "not_your_turn" };
  }

  const requester = findEmployeeById(request.employeeId);
  const isLastStep = request.currentStepIndex === request.approvalChain.length - 1;
  const days = countLeaveDays(request.startDate, request.endDate);

  // Cek saldo SEBELUM mengubah keputusan. Kalau saldo sudah habis karena
  // pengajuan lain, approval harus ditolak dengan pesan yang jelas.
  if (
    decision === "disetujui" &&
    isLastStep &&
    request.type === "cuti_tahunan" &&
    requester &&
    requester.leaveBalance < days
  ) {
    return { ok: false, error: "insufficient_balance" };
  }

  const step = request.approvalChain[request.currentStepIndex];
  step.decision = decision;
  step.decidedAt = new Date().toISOString();
  step.comment = comment;

  if (decision === "ditolak") {
    request.status = "ditolak";
    if (requester) {
      createNotification(
        "leave_rejected",
        requester.id,
        "Pengajuan cuti ditolak",
        `${request.type === "cuti_tahunan" ? "Cuti Tahunan" : request.type === "sakit" ? "Sakit" : "Izin"} — ${request.startDate} s.d. ${request.endDate}${comment ? `. Alasan: ${comment}` : ""}`,
        "/cuti",
      );
    }
    return { ok: true, request };
  }

  if (isLastStep) {
    request.status = "disetujui";
    if (requester && request.type === "cuti_tahunan") {
      requester.leaveBalance -= days;
    }
    if (requester) {
      createNotification(
        "leave_approved",
        requester.id,
        "Pengajuan cuti disetujui",
        `${request.type === "cuti_tahunan" ? "Cuti Tahunan" : request.type === "sakit" ? "Sakit" : "Izin"} — ${request.startDate} s.d. ${request.endDate}`,
        "/cuti",
      );
    }
  } else {
    request.currentStepIndex += 1;
    // Notifikasi ke approver berikutnya
    const nextStep = request.approvalChain[request.currentStepIndex];
    if (nextStep && requester) {
      createNotification(
        "leave_requested",
        nextStep.approverId,
        `Pengajuan cuti dari ${requester.name} butuh persetujuanmu`,
        `${request.type === "cuti_tahunan" ? "Cuti Tahunan" : request.type === "sakit" ? "Sakit" : "Izin"} — ${request.startDate} s.d. ${request.endDate}`,
        "/cuti/approval",
      );
    }
  }

  return { ok: true, request };
}

export function getRequestsForEmployees(employeeIds: string[]): LeaveRequest[] {
  return leaveRequests
    .filter((r) => employeeIds.includes(r.employeeId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPendingApprovalsFor(approverId: string): LeaveRequest[] {
  return leaveRequests.filter(
    (r) =>
      r.status === "menunggu" &&
      isCurrentApprover(r.approvalChain, r.currentStepIndex, approverId),
  );
}
