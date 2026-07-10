import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentEmployee } from "@/lib/current-employee";
import { decideLeaveRequest } from "@/lib/leave";

const bodySchema = z.object({
  decision: z.enum(["disetujui", "ditolak"]),
  comment: z.string().trim().max(300).optional(),
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
      { error: "invalid_input", message: "Keputusan tidak valid." },
      { status: 400 },
    );
  }

  const result = decideLeaveRequest(id, employee.id, parsed.data.decision, parsed.data.comment);

  if (!result.ok) {
    const messages: Record<string, string> = {
      not_found: "Pengajuan cuti tidak ditemukan.",
      not_your_turn: "Kamu bukan approver untuk pengajuan ini (mungkin bukan giliranmu, atau ini bukan bawahanmu).",
      already_decided: "Pengajuan ini sudah diputuskan sebelumnya.",
    };
    const statusMap: Record<string, number> = {
      not_found: 404,
      not_your_turn: 403,
      already_decided: 409,
    };
    return NextResponse.json(
      { error: result.error, message: messages[result.error] },
      { status: statusMap[result.error] },
    );
  }

  return NextResponse.json({ ok: true, request: result.request });
}
