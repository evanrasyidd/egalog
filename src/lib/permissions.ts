import { employees, findEmployeeById, getDirectReports, getSubordinateIds } from "./db";
import { ROLE_LEVEL } from "./types";
import type { Department, Employee, LeaveApprovalStep } from "./types";

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
 * Kelola rekrutmen (bikin lowongan, atur pipeline kandidat).
 *
 * Policy (disepakati): Owner & Direktur boleh semua departemen; Manager HR
 * hanya boleh mengelola lowongan departemennya sendiri (HR & GA). Manager
 * departemen lain tetap bisa melihat job board, tapi read-only. Admin adalah
 * akun sistem dan selalu lolos lewat `actorHasPermission`.
 *
 * Tanpa argumen `department`, fungsi ini menjawab "boleh mengelola minimal
 * satu departemen?" — dipakai untuk menentukan apakah UI kelola ditampilkan.
 * Untuk aksi per-lowongan, SELALU kirim department lowongan tersebut.
 */
export function canManageRecruitment(employee: Employee, department?: Department): boolean {
  if (ROLE_LEVEL[employee.role] <= ROLE_LEVEL.direktur) return true;
  if (employee.role === "manager" && employee.department === "hr") {
    return department === undefined || department === employee.department;
  }
  return false;
}

/**
 * Siapa yang boleh melihat SELURUH direktori karyawan (bukan cuma subtree):
 * Owner, Direktur, dan Manager HR. Dipisahkan dari canManageEmployees supaya
 * "boleh melihat" dan "boleh mengubah" tidak tercampur lagi.
 */
export function canViewAllEmployees(employee: Employee): boolean {
  if (ROLE_LEVEL[employee.role] <= ROLE_LEVEL.direktur) return true;
  return employee.role === "manager" && employee.department === "hr";
}

/**
 * Siapa yang boleh kelola data karyawan (tambah, edit jabatan/atasan,
 * nonaktifkan, reset password):
 * - Owner
 * - Direktur
 * - Manager departemen HR & GA
 */
export function canManageEmployees(employee: Employee): boolean {
  return canViewAllEmployees(employee);
}

/**
 * Hierarchy check: editor hanya boleh edit data karyawan yang ROLE-nya
 * LEBIH RENDAH (angka level lebih besar). Mis. Manager (level 3) hanya
 * boleh edit Supervisor (4) & Staff (5), tidak boleh edit Manager lain.
 * Admin sudah lolos di actorHasPermission, jadi tidak perlu cek hierarki.
 */
export function canEditEmployee(editor: Employee, target: Employee): boolean {
  // HR Manager perlu bisa memperbaiki data manager/supervisor/staff lintas
  // departemen, tapi tetap tidak boleh menyentuh Owner/Direktur.
  if (editor.role === "manager" && editor.department === "hr") {
    return ROLE_LEVEL[target.role] > ROLE_LEVEL.direktur;
  }
  return ROLE_LEVEL[editor.role] < ROLE_LEVEL[target.role];
}
