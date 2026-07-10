import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentEmployee } from "@/lib/current-employee";
import { changePassword } from "@/lib/profile";

const bodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter."),
});

export async function PATCH(request: Request) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_input",
        message: parsed.error.issues[0]?.message ?? "Data tidak valid.",
      },
      { status: 400 },
    );
  }

  const result = await changePassword(
    employee.id,
    parsed.data.currentPassword,
    parsed.data.newPassword,
  );

  if (!result.ok) {
    const messages: Record<string, string> = {
      employee_not_found: "Karyawan tidak ditemukan.",
      wrong_current_password: "Password saat ini salah.",
      same_as_current: "Password baru tidak boleh sama dengan password lama.",
      rate_limited: "Terlalu banyak percobaan. Coba lagi dalam 15 menit.",
    };
    const statusMap: Record<string, number> = {
      employee_not_found: 404,
      wrong_current_password: 401,
      same_as_current: 400,
      rate_limited: 429,
    };
    return NextResponse.json(
      { error: result.error, message: messages[result.error] },
      { status: statusMap[result.error] },
    );
  }

  return NextResponse.json({ ok: true });
}
