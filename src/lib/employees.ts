import "server-only";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { employees, findEmployeeById, nextNip, getDirectReports } from "./db";
import { BASE_SALARY_BY_ROLE } from "./payroll-config";
import type { Employee, Role, Department } from "./types";

/**
 * Employee TANPA passwordHash — dipakai setiap kali object employee mau
 * dikirim balik ke client lewat response API. `passwordHash` (walau berupa
 * hash bcrypt, bukan plaintext) tidak pernah boleh keluar dari server sama
 * sekali; tidak ada alasan legit client butuh field itu.
 */
export type PublicEmployee = Omit<Employee, "passwordHash">;

export function toPublicEmployee(employee: Employee): PublicEmployee {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...publicEmployee } = employee;
  return publicEmployee;
}

/**
 * Generate temp password acak & mudah dibaca (tanpa karakter ambigu seperti
 * 0/O/1/l) — dipakai untuk akun baru & reset password. HANYA dikembalikan
 * SEKALI ke pemanggil (tidak pernah disimpan/di-log dalam bentuk plaintext).
 */
export function generateTempPassword(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(10);
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += alphabet[bytes[i] % alphabet.length];
  }
  return result;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // hilangkan diakritik
    .replace(/[^a-z0-9]/g, "");
}

function generateEmployeeId(name: string): string {
  const firstWord = name.trim().split(/\s+/)[0] ?? "karyawan";
  const base = slugify(firstWord) || "karyawan";

  if (!findEmployeeById(base)) return base;

  let suffix = 2;
  while (findEmployeeById(`${base}${suffix}`)) {
    suffix += 1;
  }
  return `${base}${suffix}`;
}

/** Cek apakah `candidateManagerId` aman dijadikan atasan `employeeId` (tidak membentuk siklus). */
function isManagerAssignmentSafe(employeeId: string, candidateManagerId: string): boolean {
  if (candidateManagerId === employeeId) return false;

  let current: Employee | undefined = findEmployeeById(candidateManagerId);
  const guard = new Set<string>(); // pengaman kalau data korup/siklus tak terduga
  while (current) {
    if (current.id === employeeId) return false; // siklus terdeteksi
    if (guard.has(current.id)) break;
    guard.add(current.id);
    current = current.managerId ? findEmployeeById(current.managerId) : undefined;
  }
  return true;
}

export interface CreateEmployeeInput {
  name: string;
  role: Role;
  department: Department;
  jobTitle: string;
  managerId: string | null;
}

export type CreateEmployeeResult =
  | { ok: true; employee: Employee; tempPassword: string }
  | {
      ok: false;
      error: "manager_not_found" | "manager_required" | "owner_cannot_have_manager";
    };

export function createEmployee(input: CreateEmployeeInput): CreateEmployeeResult {
  if (input.role === "owner") {
    if (input.managerId) return { ok: false, error: "owner_cannot_have_manager" };
  } else {
    if (!input.managerId) return { ok: false, error: "manager_required" };
    if (!findEmployeeById(input.managerId)) return { ok: false, error: "manager_not_found" };
  }

  const id = generateEmployeeId(input.name);
  const nip = nextNip();
  const tempPassword = generateTempPassword();
  const passwordHash = bcrypt.hashSync(tempPassword, 10);

  const employee: Employee = {
    id,
    nip,
    name: input.name.trim(),
    email: `${id}@egalog.co.id`,
    passwordHash,
    role: input.role,
    department: input.department,
    jobTitle: input.jobTitle.trim(),
    managerId: input.managerId,
    joinedAt: new Date().toISOString().slice(0, 10),
    leaveBalance: 12,
    avatarColor: "#3D5A80",
    avatarPhoto: null,
    isActive: true,
    baseSalary: BASE_SALARY_BY_ROLE[input.role],
  };

  employees.push(employee);
  return { ok: true, employee, tempPassword };
}

export interface UpdateEmployeeInput {
  jobTitle: string;
  department: Department;
  role: Role;
  managerId: string | null;
}

export type UpdateEmployeeResult =
  | { ok: true; employee: Employee }
  | {
      ok: false;
      error:
        | "employee_not_found"
        | "manager_not_found"
        | "manager_required"
        | "owner_cannot_have_manager"
        | "manager_cycle";
    };

export function updateEmployee(
  employeeId: string,
  input: UpdateEmployeeInput,
): UpdateEmployeeResult {
  const employee = findEmployeeById(employeeId);
  if (!employee) return { ok: false, error: "employee_not_found" };

  if (input.role === "owner") {
    if (input.managerId) return { ok: false, error: "owner_cannot_have_manager" };
  } else {
    if (!input.managerId) return { ok: false, error: "manager_required" };
    if (!findEmployeeById(input.managerId)) return { ok: false, error: "manager_not_found" };
    if (!isManagerAssignmentSafe(employeeId, input.managerId)) {
      return { ok: false, error: "manager_cycle" };
    }
  }

  employee.jobTitle = input.jobTitle.trim();
  employee.department = input.department;
  employee.managerId = input.managerId;

  // Kalau role berubah, gaji pokok ikut disesuaikan ke default role baru —
  // sistem ini belum punya fitur negosiasi gaji individual di luar band role.
  if (employee.role !== input.role) {
    employee.role = input.role;
    employee.baseSalary = BASE_SALARY_BY_ROLE[input.role];
  }

  return { ok: true, employee };
}

export type DeactivateResult =
  | { ok: true; employee: Employee }
  | { ok: false; error: "employee_not_found" | "is_owner" | "has_active_reports" };

export function deactivateEmployee(employeeId: string): DeactivateResult {
  const employee = findEmployeeById(employeeId);
  if (!employee) return { ok: false, error: "employee_not_found" };
  if (employee.role === "owner") return { ok: false, error: "is_owner" };

  const activeReports = getDirectReports(employeeId);
  if (activeReports.length > 0) return { ok: false, error: "has_active_reports" };

  employee.isActive = false;
  return { ok: true, employee };
}

export type ReactivateResult =
  | { ok: true; employee: Employee }
  | { ok: false; error: "employee_not_found" };

export function reactivateEmployee(employeeId: string): ReactivateResult {
  const employee = findEmployeeById(employeeId);
  if (!employee) return { ok: false, error: "employee_not_found" };

  employee.isActive = true;
  return { ok: true, employee };
}

export type ResetPasswordResult =
  | { ok: true; tempPassword: string }
  | { ok: false; error: "employee_not_found" };

export function resetEmployeePassword(employeeId: string): ResetPasswordResult {
  const employee = findEmployeeById(employeeId);
  if (!employee) return { ok: false, error: "employee_not_found" };

  const tempPassword = generateTempPassword();
  employee.passwordHash = bcrypt.hashSync(tempPassword, 10);
  return { ok: true, tempPassword };
}
