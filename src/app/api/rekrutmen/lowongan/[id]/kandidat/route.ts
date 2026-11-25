import { NextResponse } from "next/server";
import { z } from "zod";
import {
  actorCanManageRecruitment,
  getCurrentActor,
  actorId,
} from "@/lib/current-actor";
import {
  addCandidate,
  getCandidatesForJob,
  findJobPostingById,
} from "@/lib/recruitment";
import { parseResumeDataUrl } from "@/lib/file";

async function authorizedJob(id: string) {
  const actor = await getCurrentActor();
  if (!actor) {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }

  const job = findJobPostingById(id);
  if (!job) {
    return {
      error: NextResponse.json(
        { error: "not_found", message: "Lowongan tidak ditemukan." },
        { status: 404 },
      ),
    };
  }

  if (!actorCanManageRecruitment(actor, job.department)) {
    return {
      error: NextResponse.json(
        {
          error: "forbidden",
          message: "Kamu hanya bisa mengelola kandidat untuk departemenmu sendiri.",
        },
        { status: 403 },
      ),
    };
  }

  return { actor, job };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await authorizedJob(id);
  if ("error" in auth) return auth.error;

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
  const { id } = await params;
  const auth = await authorizedJob(id);
  if ("error" in auth) return auth.error;

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: "Data kandidat tidak lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  if (parsed.data.resumeFile) {
    const file = parseResumeDataUrl(parsed.data.resumeFile);
    if (!file.ok) {
      return NextResponse.json(
        {
          error: "invalid_file",
          message:
            file.error === "too_large"
              ? "Ukuran CV maksimal 2 MB."
              : "File CV harus PDF, DOC, atau DOCX yang valid.",
        },
        { status: 400 },
      );
    }
  }

  const result = addCandidate(
    id,
    actorId(auth.actor),
    parsed.data.name,
    parsed.data.email,
    parsed.data.phone,
    parsed.data.resumeNote,
    parsed.data.resumeFile,
    // Kandidat yang ditambahkan manual oleh HR dianggap sudah memberi izin
    // pemrosesan data lewat proses rekrutmen internal.
    new Date().toISOString(),
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: "job_not_found", message: "Lowongan tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, candidate: result.candidate }, { status: 201 });
}
