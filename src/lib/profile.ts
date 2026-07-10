import "server-only";
import bcrypt from "bcryptjs";
import { findEmployeeById } from "./db";
import { createRateLimiter } from "./rate-limiter";

export const AVATAR_COLOR_PRESETS = [
  "#1E2A44", // navy (default brand)
  "#2D4159",
  "#3D5A80",
  "#6B8CAE",
  "#B08968",
  "#C96A2E", // amber (default brand accent)
  "#2F7D4F",
  "#6B4E71",
] as const;

export type AvatarColor = (typeof AVATAR_COLOR_PRESETS)[number];

export function isValidAvatarColor(color: string): color is AvatarColor {
  return (AVATAR_COLOR_PRESETS as readonly string[]).includes(color);
}

// Rate limit percobaan ganti password — sesi yang sudah login pun tidak boleh
// dipakai untuk brute-force password lama tanpa batas (defense-in-depth,
// pola sama seperti rate limit login di lib/auth.ts).
const passwordChangeLimiter = createRateLimiter(5, 15 * 60 * 1000);

export type ChangePasswordResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "employee_not_found"
        | "wrong_current_password"
        | "same_as_current"
        | "rate_limited";
    };

export async function changePassword(
  employeeId: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  if (passwordChangeLimiter.isLimited(employeeId)) {
    return { ok: false, error: "rate_limited" };
  }

  const employee = findEmployeeById(employeeId);
  if (!employee) return { ok: false, error: "employee_not_found" };

  const isCurrentValid = await bcrypt.compare(currentPassword, employee.passwordHash);
  if (!isCurrentValid) {
    passwordChangeLimiter.recordFailure(employeeId);
    return { ok: false, error: "wrong_current_password" };
  }

  const isSame = await bcrypt.compare(newPassword, employee.passwordHash);
  if (isSame) return { ok: false, error: "same_as_current" };

  employee.passwordHash = await bcrypt.hash(newPassword, 10);
  passwordChangeLimiter.clear(employeeId);
  return { ok: true };
}

export type UpdateAvatarColorResult =
  | { ok: true }
  | { ok: false; error: "employee_not_found" | "invalid_color" };

export function updateAvatarColor(employeeId: string, color: string): UpdateAvatarColorResult {
  const employee = findEmployeeById(employeeId);
  if (!employee) return { ok: false, error: "employee_not_found" };
  if (!isValidAvatarColor(color)) return { ok: false, error: "invalid_color" };

  employee.avatarColor = color;
  return { ok: true };
}

export type UpdateAvatarPhotoResult =
  | { ok: true }
  | { ok: false; error: "employee_not_found" };

/** `photo = null` untuk menghapus foto (kembali ke inisial+warna). */
export function updateAvatarPhoto(
  employeeId: string,
  photo: string | null,
): UpdateAvatarPhotoResult {
  const employee = findEmployeeById(employeeId);
  if (!employee) return { ok: false, error: "employee_not_found" };

  employee.avatarPhoto = photo;
  return { ok: true };
}
