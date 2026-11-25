import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentActor, actorHasPermission, actorId } from "@/lib/current-actor";
import { canManageRecruitment } from "@/lib/permissions";
import {
  createJobPosting,
  getAllJobPostings,
  getOpenJobPostings,
  type CreateJobInput,
} from "@/lib/recruitment";
import type { Department } from "@/lib/types";

export async function GET() {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const isManager = actorHasPermission(actor, canManageRecruitment);
  if (!isManager) {
    return NextResponse.json({ postings: getOpenJobPostings(), canManage: false });
  }

  // Manager hanya mengelola departemennya sendiri, tapi tetap boleh melihat
  // lowongan departemen lain yang sedang dibuka.
  const all = getAllJobPostings();
  const postings =
    actor.type === "admin"
      ? all
      : all.filter(
          (job) =>
            canManageRecruitment(actor.employee, job.department) || job.status === "dibuka",
        );

  return NextResponse.json({ postings, canManage: true });
}

const bodySchema = z.object({
  title: z.string().trim().min(3).max(150),
  department: z.enum(["operasional", "armada", "sales", "finance", "hr", "it"]),
  employmentType: z.enum(["full_time", "kontrak", "magang"]),
  description: z.string().trim().min(10).max(2000),
  requirements: z.string().trim().min(10).max(2000),
  location: z.string().trim().min(3).max(120).default("Depok, Jawa Barat"),
  workArrangement: z.enum(["onsite", "hybrid", "remote"]).default("onsite"),
  salaryRange: z.string().trim().max(80).nullable().optional().default(null),
  deadline: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD.")
    .nullable()
    .optional()
    .default(null),
});

export async function POST(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: "Data lowongan tidak lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  // Scope dicek SETELAH departemen diketahui: Manager HR tidak boleh membuat
  // lowongan untuk departemen lain, Owner/Direktur boleh semua.
  const department = parsed.data.department as Department;
  if (
    !actorHasPermission(actor, (employee) =>
      canManageRecruitment(employee, department),
    )
  ) {
    return NextResponse.json(
      {
        error: "forbidden",
        message: "Kamu hanya bisa membuat lowongan untuk departemenmu sendiri.",
      },
      { status: 403 },
    );
  }

  const input: CreateJobInput = {
    title: parsed.data.title,
    department,
    employmentType: parsed.data.employmentType,
    description: parsed.data.description,
    requirements: parsed.data.requirements,
    location: parsed.data.location,
    workArrangement: parsed.data.workArrangement,
    salaryRange: parsed.data.salaryRange?.trim() ? parsed.data.salaryRange : null,
    deadline: parsed.data.deadline,
  };

  const posting = createJobPosting(actorId(actor), input);

  return NextResponse.json({ ok: true, posting }, { status: 201 });
}
