import "server-only";
import { leaveRequests, findEmployeeById, nextLeaveId } from "./db";
import { buildApprovalChain, isCurrentApprover } from "./permissions";
import { createNotification } from "./notifications";
import type { LeaveRequest, LeaveType } from "./types";

function countLeaveDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
}

export type CreateLeaveResult =
  | { ok: true; request: LeaveRequest }
  | { ok: false; error: "insufficient_balance" | "invalid_date_range" | "employee_not_found" };

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

  const days = countLeaveDays(startDate, endDate);
  if (type === "cuti_tahunan" && days > employee.leaveBalance) {
    return { ok: false, error: "insufficient_balance" };
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
  | { ok: false; error: "not_found" | "not_your_turn" | "already_decided" };

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

  const step = request.approvalChain[request.currentStepIndex];
  step.decision = decision;
  step.decidedAt = new Date().toISOString();
  step.comment = comment;

  const requester = findEmployeeById(request.employeeId);
  const approver = findEmployeeById(approverId);

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

  const isLastStep = request.currentStepIndex === request.approvalChain.length - 1;
  if (isLastStep) {
    request.status = "disetujui";
    const employee = findEmployeeById(request.employeeId);
    if (employee && request.type === "cuti_tahunan") {
      const days = countLeaveDays(request.startDate, request.endDate);
      employee.leaveBalance -= days;
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
  return leaveRequests.filter((r) =>
    isCurrentApprover(r.approvalChain, r.currentStepIndex, approverId),
  );
}
