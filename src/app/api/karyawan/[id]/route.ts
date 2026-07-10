import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentActor, actorHasPermission } from "@/lib/current-actor";
import { canManageEmployees } from "@/lib/permissions";
import { updateEmployee, toPublicEmployee } from "@/lib/employees";

const bodySchema = z.object({
  jobTitle: z.string().trim().min(2).max(150),
  department: z.enum(["operasional", "armada", "sales", "finance", "hr", "it"]),
  role: z.enum(["owner", "direktur", "manager", "supervisor", "staff"]),
  managerId: z.string().min(1).nullable(),
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
    return NextResponse.json(
      { error: "forbidden", message: "Kamu tidak punya akses untuk mengubah data karyawan." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: "Data tidak lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const result = updateEmployee(id, parsed.data);
  if (!result.ok) {
    const messages: Record<string, string> = {
      employee_not_found: "Karyawan tidak ditemukan.",
      manager_not_found: "Atasan yang dipilih tidak ditemukan.",
      manager_required: "Karyawan dengan role selain Owner wajib punya atasan.",
      owner_cannot_have_manager: "Role Owner tidak boleh punya atasan.",
      manager_cycle:
        "Tidak bisa memilih atasan ini — akan membentuk siklus di garis komando (mis. menjadikan bawahan sendiri sebagai atasan).",
    };
    const statusMap: Record<string, number> = { employee_not_found: 404 };
    return NextResponse.json(
      { error: result.error, message: messages[result.error] },
      { status: statusMap[result.error] ?? 422 },
    );
  }

  return NextResponse.json({ ok: true, employee: toPublicEmployee(result.employee) });
}
