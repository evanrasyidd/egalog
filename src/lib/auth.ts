import "server-only";
import bcrypt from "bcryptjs";
import { findEmployeeByEmail, findAdminByUsername } from "./db";
import { createRateLimiter } from "./rate-limiter";
import type { Employee, AdminAccount } from "./types";

// Dipisah jadi limiter sendiri-sendiri supaya employee & admin punya "ruang"
// rate-limit masing-masing (percobaan gagal ke satu tidak memengaruhi yang lain).
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 menit

const employeeLoginLimiter = createRateLimiter(MAX_ATTEMPTS, WINDOW_MS);
const adminLoginLimiter = createRateLimiter(MAX_ATTEMPTS, WINDOW_MS);

export type LoginResult =
  | { ok: true; employee: Employee }
  | { ok: false; error: "rate_limited" | "invalid_credentials" | "account_deactivated" };

export async function verifyLogin(email: string, password: string): Promise<LoginResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (employeeLoginLimiter.isLimited(normalizedEmail)) {
    return { ok: false, error: "rate_limited" };
  }

  const employee = findEmployeeByEmail(normalizedEmail);
  if (!employee) {
    employeeLoginLimiter.recordFailure(normalizedEmail);
    return { ok: false, error: "invalid_credentials" };
  }

  const valid = await bcrypt.compare(password, employee.passwordHash);
  if (!valid) {
    employeeLoginLimiter.recordFailure(normalizedEmail);
    return { ok: false, error: "invalid_credentials" };
  }

  // Sengaja dicek SETELAH password terverifikasi benar, bukan sebelumnya —
  // supaya penyerang yang belum tau password tetap cuma dapat
  // "invalid_credentials" generik (nggak bisa dipakai buat enumerasi akun
  // mana yang nonaktif). Yang benar-benar tau password lama (mis. eks
  // karyawan itu sendiri) baru dikasih tau alasan jelas kenapa gak bisa masuk.
  if (!employee.isActive) {
    return { ok: false, error: "account_deactivated" };
  }

  employeeLoginLimiter.clear(normalizedEmail);
  return { ok: true, employee };
}

export type AdminLoginResult =
  | { ok: true; admin: AdminAccount }
  | { ok: false; error: "rate_limited" | "invalid_credentials" };

export async function verifyAdminLogin(
  username: string,
  password: string,
): Promise<AdminLoginResult> {
  const normalizedUsername = username.trim().toLowerCase();

  if (adminLoginLimiter.isLimited(normalizedUsername)) {
    return { ok: false, error: "rate_limited" };
  }

  const admin = findAdminByUsername(normalizedUsername);
  if (!admin) {
    adminLoginLimiter.recordFailure(normalizedUsername);
    return { ok: false, error: "invalid_credentials" };
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    adminLoginLimiter.recordFailure(normalizedUsername);
    return { ok: false, error: "invalid_credentials" };
  }

  adminLoginLimiter.clear(normalizedUsername);
  return { ok: true, admin };
}
