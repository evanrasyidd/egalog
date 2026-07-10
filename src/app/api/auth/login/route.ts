import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyLogin, verifyAdminLogin } from "@/lib/auth";
import { createSession } from "@/lib/session";

// Bukan email-only lagi — Admin login pakai username, bukan email
// @egalog.co.id seperti karyawan (karena memang bukan karyawan).
const bodySchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: "Email/username atau password tidak valid." },
      { status: 400 },
    );
  }

  const { identifier, password } = parsed.data;

  // Coba sebagai karyawan dulu (mayoritas login lewat jalur ini).
  const employeeResult = await verifyLogin(identifier, password);

  if (employeeResult.ok) {
    await createSession({
      type: "employee",
      sub: employeeResult.employee.id,
      role: employeeResult.employee.role,
      name: employeeResult.employee.name,
      department: employeeResult.employee.department,
    });
    return NextResponse.json({ ok: true });
  }

  if (employeeResult.error === "rate_limited") {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
      },
      { status: 429 },
    );
  }

  if (employeeResult.error === "account_deactivated") {
    return NextResponse.json(
      {
        error: "account_deactivated",
        message: "Akun kamu sudah tidak aktif. Hubungi HR & GA kalau ini keliru.",
      },
      { status: 403 },
    );
  }

  // Bukan karyawan (atau salah password) — coba sebagai Admin sebelum
  // menyerah. Tidak membocorkan mana dari dua sistem ini yang "hampir benar".
  const adminResult = await verifyAdminLogin(identifier, password);

  if (adminResult.ok) {
    await createSession({
      type: "admin",
      sub: adminResult.admin.id,
      name: adminResult.admin.name,
    });
    return NextResponse.json({ ok: true });
  }

  if (adminResult.error === "rate_limited") {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
      },
      { status: 429 },
    );
  }

  return NextResponse.json(
    { error: "invalid_credentials", message: "Email/username atau password salah." },
    { status: 401 },
  );
}
