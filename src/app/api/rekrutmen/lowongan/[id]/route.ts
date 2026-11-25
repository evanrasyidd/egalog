import { NextResponse } from "next/server";
import {
  actorCanManageRecruitment,
  getCurrentActor,
} from "@/lib/current-actor";
import { findJobPostingById, toggleJobStatus } from "@/lib/recruitment";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = findJobPostingById(id);
  if (!job) {
    return NextResponse.json({ error: "not_found", message: "Lowongan tidak ditemukan." }, { status: 404 });
  }

  if (!actorCanManageRecruitment(actor, job.department)) {
    return NextResponse.json(
      {
        error: "forbidden",
        message: "Kamu hanya bisa mengelola lowongan departemenmu sendiri.",
      },
      { status: 403 },
    );
  }

  const result = toggleJobStatus(id);
  if (!result.ok) {
    return NextResponse.json({ error: "not_found", message: "Lowongan tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, posting: result.posting });
}
