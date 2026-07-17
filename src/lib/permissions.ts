import { employees, findEmployeeById, getDirectReports, getSubordinateIds } from "./db";
import { ROLE_LEVEL } from "./types";
import type { Employee, LeaveApprovalStep, Role } from "./types";

/**
 * Kebijakan approval cuti EgaLog:
 * - Staff yang atasan langsungnya Supervisor  -> Supervisor lalu Manager (2 tahap)
 * - Staff yang atasan langsungnya Manager (dept tanpa Supervisor) -> Manager saja
 * - Supervisor -> Manager
 * - Manager -> Direktur
 * - Direktur -> Owner
 * - Owner -> tidak perlu approval (auto-disetujui)
 */
export function buildApprovalChain(employee: Employee): LeaveApprovalStep[] {
  const chain: LeaveApprovalStep[] = [];
  if (!employee.managerId) return chain;

  const directManager = findEmployeeById(employee.managerId);
  if (!directManager) return chain;

  chain.push({
    approverId: directManager.id,
    approverRole: directManager.role,
    decision: "menunggu",
    decidedAt: null,
  });

  const isStaffUnderSupervisor =
    employee.role === "staff" && directManager.role === "supervisor";

  if (isStaffUnderSupervisor && directManager.managerId) {
    const secondApprover = findEmployeeById(directManager.managerId);
    if (secondApprover) {
      chain.push({
        approverId: secondApprover.id,
        approverRole: secondApprover.role,
        decision: "menunggu",
        decidedAt: null,
      });
    }
  }

  return chain;
}

/** Apakah `viewerId` berhak melihat data milik `targetId`? */
export function canViewEmployeeData(viewerId: string, targetId: string): boolean {
  if (viewerId === targetId) return true;
  const subordinates = getSubordinateIds(viewerId);
  return subordinates.has(targetId);
}

export function isManagerLevel(role: Role): boolean {
  return ROLE_LEVEL[role] <= ROLE_LEVEL.supervisor;
}

/**
 * Siapa yang boleh generate & lihat payslip semua karyawan:
 * - Owner & Direktur (mengawasi seluruh perusahaan)
 * - Manager departemen Finance (yang menjalankan proses payroll sehari-hari)
 * Selain itu, semua karyawan tetap boleh lihat payslip milik sendiri —
 * itu dicek terpisah di layer route/page, bukan di sini.
 */
export function canManagePayroll(employee: Employee): boolean {
  if (ROLE_LEVEL[employee.role] <= ROLE_LEVEL.direktur) return true;
  return employee.role === "manager" && employee.department === "finance";
}

/** Apakah `approverId` adalah approver yang sedang aktif untuk sebuah leave request? */
export function isCurrentApprover(
  approvalChain: LeaveApprovalStep[],
  currentStepIndex: number,
  approverId: string,
): boolean {
  const step = approvalChain[currentStepIndex];
  return !!step && step.approverId === approverId && step.decision === "menunggu";
}

/** Apakah `managerId` adalah atasan LANGSUNG (bukan sekadar di garis komando) dari `employeeId`? */
export function isDirectManagerOf(managerId: string, employeeId: string): boolean {
  const employee = findEmployeeById(employeeId);
  return !!employee && employee.managerId === managerId;
}

/**
 * Siapa yang boleh set goal & isi review performance untuk `employeeId`:
 * - Atasan langsung (pola dasar, tetap berlaku buat manager/supervisor).
 * - Owner & Direktur (mengawasi seluruh perusahaan) — mengikuti pola yang
 *   sama dengan canManagePayroll/canManageRecruitment/canManageEmployees,
 *   supaya Owner tidak terkunci cuma bisa kelola direct report-nya sendiri.
 */
export function canManagePerformanceFor(actorId: string, employeeId: string): boolean {
  if (isDirectManagerOf(actorId, employeeId)) return true;
  const actor = findEmployeeById(actorId);
  return !!actor && ROLE_LEVEL[actor.role] <= ROLE_LEVEL.direktur;
}

/** Daftar karyawan yang boleh di-kelola performance-nya oleh `actor`. */
export function getManageablePerformanceEmployees(actor: Employee): Employee[] {
  if (ROLE_LEVEL[actor.role] <= ROLE_LEVEL.direktur) {
    return employees.filter((e) => e.isActive && e.id !== actor.id);
  }
  return getDirectReports(actor.id);
}

/**
 * Siapa yang boleh bikin lowongan & kelola pipeline kandidat:
 * - Owner & Direktur
 * - Manager departemen HR & GA
 * Karyawan lain tetap boleh LIHAT daftar lowongan yang dibuka (internal job
 * board, read-only) — itu tidak butuh permission khusus, dicek di halaman.
 */
export function canManageRecruitment(employee: Employee): boolean {
  if (ROLE_LEVEL[employee.role] <= ROLE_LEVEL.direktur) return true;
  return employee.role === "manager" && employee.department === "hr";
}

/**
 * Siapa yang boleh kelola data karyawan (tambah, edit jabatan/atasan,
 * nonaktifkan, reset password):
 * - Owner & Direktur
 * - Manager departemen HR & GA
 * Sengaja dipisah dari canManageRecruitment meski POPULASI-nya kebetulan
 * sama persis sekarang — dua concern yang beda (data karyawan vs pipeline
 * rekrutmen), supaya kalau nanti aturannya perlu beda, nggak keliru ubah
 * satu fungsi yang dipakai bareng untuk dua hal yang sebenernya beda.
 */
export function canManageEmployees(employee: Employee): boolean {
  if (ROLE_LEVEL[employee.role] <= ROLE_LEVEL.direktur) return true;
  return employee.role === "manager" && employee.department === "hr";
}
