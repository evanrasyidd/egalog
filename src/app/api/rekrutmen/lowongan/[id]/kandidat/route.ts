import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentActor, actorHasPermission, actorId } from "@/lib/current-actor";
import { canManageRecruitment } from "@/lib/permissions";
import { addCandidate, getCandidatesForJob, findJobPostingById } from "@/lib/recruitment";

export async function GET(
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
  if (!findJobPostingById(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ candidates: getCandidatesForJob(id) });
}

const bodySchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6).max(30),
  resumeNote: z.string().trim().max(2000).default(""),
  resumeFile: z
    .string()
    .trim()
    .max(2_800_000)
    .refine((s) => s.startsWith("data:"), "Format file tidak valid.")
    .nullable()
    .optional()
    .default(null),
});

export async function POST(
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
      { error: "invalid_input", message: "Data kandidat tidak lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const result = addCandidate(
    id,
    actorId(actor),
    parsed.data.name,
    parsed.data.email,
    parsed.data.phone,
    parsed.data.resumeNote,
    parsed.data.resumeFile,
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: "job_not_found", message: "Lowongan tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, candidate: result.candidate }, { status: 201 });
}
