import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentEmployee } from "@/lib/current-employee";
import { updateGoalStatus } from "@/lib/performance";

const bodySchema = z.object({
  status: z.enum(["belum_mulai", "berjalan", "tercapai", "tidak_tercapai"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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

  const result = updateGoalStatus(id, employee.id, parsed.data.status);
  if (!result.ok) {
    const messages: Record<string, string> = {
      not_found: "Goal tidak ditemukan.",
      forbidden: "Kamu tidak punya akses untuk mengubah goal ini.",
    };
    const statusMap: Record<string, number> = { not_found: 404, forbidden: 403 };
    return NextResponse.json(
      { error: result.error, message: messages[result.error] },
      { status: statusMap[result.error] },
    );
  }

  return NextResponse.json({ ok: true, goal: result.goal });
}
