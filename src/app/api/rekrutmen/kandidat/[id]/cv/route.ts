import { NextResponse } from "next/server";
import {
  actorCanManageRecruitment,
  getCurrentActor,
} from "@/lib/current-actor";
import {
  findCandidateById,
  findJobPostingForCandidate,
} from "@/lib/recruitment";

const MIME_EXTENSION: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

/**
 * CV pelamar tidak pernah disajikan sebagai data URL di HTML. Endpoint ini
 * memeriksa sesi + scope departemen, lalu mengirim file sebagai attachment.
 * Ini mencegah CV orang lain diambil hanya dengan menebak ID kandidat.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const candidate = findCandidateById(id);
  const job = findJobPostingForCandidate(id);
  if (!candidate || !job) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!actorCanManageRecruitment(actor, job.department)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!candidate.resumeFile) {
    return NextResponse.json({ error: "no_file" }, { status: 404 });
  }

  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(candidate.resumeFile);
  if (!match) {
    return NextResponse.json({ error: "invalid_file" }, { status: 422 });
  }

  const mime = match[1].toLowerCase();
  const extension = MIME_EXTENSION[mime];
  if (!extension) {
    return NextResponse.json({ error: "invalid_file" }, { status: 422 });
  }

  const bytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  const safeName = candidate.name.replace(/[^\w\-]+/g, "_").slice(0, 80) || "kandidat";

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${safeName}_CV.${extension}"`,
      "Content-Length": String(bytes.length),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
