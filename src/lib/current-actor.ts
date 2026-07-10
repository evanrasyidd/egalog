import "server-only";
import { getSession } from "./session";
import { findEmployeeById, findAdminById } from "./db";
import type { Employee, AdminAccount } from "./types";

export type Actor =
  | { type: "employee"; employee: Employee }
  | { type: "admin"; admin: AdminAccount };

/**
 * Siapa yang sedang login — Employee ATAU Admin. Dipakai di halaman/route
 * "kelola" (Karyawan, Payroll, Rekrutmen) yang harus bisa diakses oleh
 * keduanya. Untuk fitur yang cuma masuk akal buat Employee (absensi, cuti,
 * profile, review performance sebagai atasan langsung), tetap pakai
 * `getCurrentEmployee()` seperti biasa — Admin memang sengaja tidak masuk
 * ke fitur-fitur itu karena bukan bagian dari struktur karyawan.
 */
export async function getCurrentActor(): Promise<Actor | null> {
  const session = await getSession();
  if (!session) return null;

  if (session.type === "admin") {
    const admin = findAdminById(session.sub);
    if (!admin) return null;
    return { type: "admin", admin };
  }

  const employee = findEmployeeById(session.sub);
  if (!employee || !employee.isActive) return null;
  return { type: "employee", employee };
}

/**
 * Cek permission untuk actor gabungan: Admin SELALU lolos (full akses ke
 * fitur kelola), Employee dicek pakai fungsi permission yang sudah ada
 * (canManagePayroll, canManageEmployees, dst) — jadi fungsi-fungsi itu
 * tidak perlu diubah sama sekali, cukup dibungkus di sini.
 */
export function actorHasPermission(
  actor: Actor | null,
  check: (employee: Employee) => boolean,
): boolean {
  if (!actor) return false;
  if (actor.type === "admin") return true;
  return check(actor.employee);
}

export function actorName(actor: Actor): string {
  return actor.type === "admin" ? actor.admin.name : actor.employee.name;
}

export function actorId(actor: Actor): string {
  return actor.type === "admin" ? actor.admin.id : actor.employee.id;
}
