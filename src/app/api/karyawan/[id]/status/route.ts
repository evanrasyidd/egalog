import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentActor, actorHasPermission, actorId } from "@/lib/current-actor";
import { canManageEmployees } from "@/lib/permissions";
import { deactivateEmployee, reactivateEmployee, toPublicEmployee } from "@/lib/employees";

const bodySchema = z.object({
  isActive: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!actorHasPermission(actor, canManageEmployees)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: "Status tidak valid." },
      { status: 400 },
    );
  }

  if (id === actorId(actor) && !parsed.data.isActive) {
    return NextResponse.json(
      { error: "cannot_deactivate_self", message: "Kamu tidak bisa menonaktifkan akunmu sendiri." },
      { status: 400 },
    );
  }

  const result = parsed.data.isActive
    ? reactivateEmployee(id)
    : deactivateEmployee(id);

  if (!result.ok) {
    const messages: Record<string, string> = {
      employee_not_found: "Karyawan tidak ditemukan.",
      is_owner: "Akun Owner tidak bisa dinonaktifkan.",
      has_active_reports:
        "Karyawan ini masih punya bawahan aktif. Pindahkan bawahannya ke atasan lain dulu sebelum menonaktifkan.",
    };
    const statusMap: Record<string, number> = { employee_not_found: 404 };
    return NextResponse.json(
      { error: result.error, message: messages[result.error] },
      { status: statusMap[result.error] ?? 422 },
    );
  }

  return NextResponse.json({ ok: true, employee: toPublicEmployee(result.employee) });
}
