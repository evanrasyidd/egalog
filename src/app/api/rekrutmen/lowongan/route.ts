import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentActor, actorHasPermission, actorId } from "@/lib/current-actor";
import { canManageRecruitment } from "@/lib/permissions";
import { createJobPosting, getAllJobPostings, getOpenJobPostings } from "@/lib/recruitment";

export async function GET() {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const isManager = actorHasPermission(actor, canManageRecruitment);
  const postings = isManager ? getAllJobPostings() : getOpenJobPostings();

  return NextResponse.json({ postings, canManage: isManager });
}

const bodySchema = z.object({
  title: z.string().trim().min(3).max(150),
  department: z.enum(["operasional", "armada", "sales", "finance", "hr", "it"]),
  employmentType: z.enum(["full_time", "kontrak", "magang"]),
  description: z.string().trim().min(10).max(2000),
  requirements: z.string().trim().min(10).max(2000),
});

export async function POST(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!actorHasPermission(actor, canManageRecruitment)) {
    return NextResponse.json(
      { error: "forbidden", message: "Kamu tidak punya akses untuk membuat lowongan." },
      { status: 403 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: "Data lowongan tidak lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const posting = createJobPosting(
    actorId(actor),
    parsed.data.title,
    parsed.data.department,
    parsed.data.employmentType,
    parsed.data.description,
    parsed.data.requirements,
  );

  return NextResponse.json({ ok: true, posting }, { status: 201 });
}
