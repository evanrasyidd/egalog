import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentActor, actorHasPermission } from "@/lib/current-actor";
import { canManageEmployees } from "@/lib/permissions";
import { createEmployee, toPublicEmployee } from "@/lib/employees";

const bodySchema = z.object({
  name: z.string().trim().min(3).max(150),
  role: z.enum(["owner", "direktur", "manager", "supervisor", "staff"]),
  department: z.enum(["operasional", "armada", "sales", "finance", "hr", "it"]),
  jobTitle: z.string().trim().min(2).max(150),
  managerId: z.string().min(1).nullable(),
});

export async function POST(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!actorHasPermission(actor, canManageEmployees)) {
    return NextResponse.json(
      { error: "forbidden", message: "Kamu tidak punya akses untuk menambah karyawan." },
      { status: 403 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: "Data karyawan tidak lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const result = createEmployee(parsed.data);
  if (!result.ok) {
    const messages: Record<string, string> = {
      manager_not_found: "Atasan yang dipilih tidak ditemukan.",
      manager_required: "Karyawan dengan role selain Owner wajib punya atasan.",
      owner_cannot_have_manager: "Role Owner tidak boleh punya atasan.",
    };
    return NextResponse.json(
      { error: result.error, message: messages[result.error] },
      { status: 422 },
    );
  }

  return NextResponse.json(
    { ok: true, employee: toPublicEmployee(result.employee), tempPassword: result.tempPassword },
    { status: 201 },
  );
}
