import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findJobPostingById, getCandidatesForJob } from "@/lib/recruitment";

export const metadata: Metadata = { title: "Admin • Detail Lowongan" };
import { DEPARTMENT_LABEL } from "@/lib/types";
import { EMPLOYMENT_TYPE_LABEL, WORK_ARRANGEMENT_LABEL } from "@/lib/labels";
import { formatDateID } from "@/lib/date";
import { Card, PageHeader } from "@/components/card";
import { StatusBadge } from "@/components/status-badge";
import { BackLink } from "@/components/back-link";
import { AddCandidateForm } from "@/components/add-candidate-form";
import { CandidateStageEditor } from "@/components/candidate-stage-editor";

function formatDate(iso: string): string {
  return formatDateID(iso.slice(0, 10), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminJobPostingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const posting = findJobPostingById(id);
  if (!posting) notFound();

  const candidateList = getCandidatesForJob(id);

  return (
    <div>
      <BackLink href="/admin/rekrutmen" label="Kembali ke Kelola Rekrutmen" />

      <PageHeader
        title={posting.title}
        description={`${DEPARTMENT_LABEL[posting.department]} · ${EMPLOYMENT_TYPE_LABEL[posting.employmentType]} · ${WORK_ARRANGEMENT_LABEL[posting.workArrangement]}`}
        action={<StatusBadge status={posting.status} />}
      />

      <Card className="mb-5">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4 pb-4 border-b border-border">
          <div>
            <dt className="text-xs text-muted-foreground mb-1">Lokasi</dt>
            <dd>{posting.location}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground mb-1">Rentang Gaji</dt>
            <dd>{posting.salaryRange ?? "Dirahasiakan"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground mb-1">Batas Lamaran</dt>
            <dd>{posting.deadline ? formatDateID(posting.deadline) : "Tanpa batas"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground mb-1">Dipublikasikan</dt>
            <dd>{formatDateID(posting.createdAt.slice(0, 10))}</dd>
          </div>
        </dl>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Deskripsi</p>
            <p>{posting.description}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Kualifikasi</p>
            <p>{posting.requirements}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Kandidat ({candidateList.length})</h2>
        </div>

        <AddCandidateForm jobPostingId={id} />

        {candidateList.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground py-8 text-center">
              Belum ada kandidat untuk lowongan ini.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {candidateList.map((c) => (
              <Card key={c.id}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.email} · {c.phone}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    Lamar {formatDate(c.appliedAt)}
                  </span>
                </div>
                {c.resumeNote && (
                  <p className="text-sm text-foreground/80 mb-3">{c.resumeNote}</p>
                )}
                {c.resumeFile && (
                  <a
                    href={`/api/rekrutmen/kandidat/${c.id}/cv`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mb-3 rounded-[8px] border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-muted transition-colors"
                  >
                    Unduh CV
                  </a>
                )}
                <div className="border-t border-border pt-3">
                  <CandidateStageEditor
                    candidateId={c.id}
                    currentStage={c.stage}
                    currentNotes={c.notes}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
