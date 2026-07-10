import { NextResponse } from "next/server";
import { getCurrentActor, actorHasPermission } from "@/lib/current-actor";
import { canManageRecruitment } from "@/lib/permissions";
import { toggleJobStatus } from "@/lib/recruitment";

export async function PATCH(
  _request: Request,
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
  const result = toggleJobStatus(id);
  if (!result.ok) {
    return NextResponse.json({ error: "not_found", message: "Lowongan tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, posting: result.posting });
}
