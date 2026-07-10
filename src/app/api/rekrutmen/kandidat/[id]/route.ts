import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentActor, actorHasPermission, actorId } from "@/lib/current-actor";
import { canManageRecruitment } from "@/lib/permissions";
import { updateCandidateStage } from "@/lib/recruitment";

const bodySchema = z.object({
  stage: z.enum(["lamar", "interview", "offer", "diterima", "ditolak"]),
  notes: z.string().trim().max(2000).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!actorHasPermission(actor, canManageRecruitment)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: "Data tidak valid." },
      { status: 400 },
    );
  }

  const result = updateCandidateStage(id, actorId(actor), parsed.data.stage, parsed.data.notes);
  if (!result.ok) {
    return NextResponse.json(
      { error: "not_found", message: "Kandidat tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, candidate: result.candidate });
}
