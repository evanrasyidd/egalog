import { redirect, notFound } from "next/navigation";
import { getCurrentEmployee } from "@/lib/current-employee";
import { canManageRecruitment } from "@/lib/permissions";
import { findJobPostingById, getCandidatesForJob } from "@/lib/recruitment";
import { DEPARTMENT_LABEL } from "@/lib/types";
import { Card, PageHeader } from "@/components/card";
import { StatusBadge } from "@/components/status-badge";
import { BackLink } from "@/components/back-link";
import { AddCandidateForm } from "@/components/add-candidate-form";
import { CandidateStageEditor } from "@/components/candidate-stage-editor";

const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  full_time: "Full-time",
  kontrak: "Kontrak",
  magang: "Magang",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function JobPostingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const employee = await getCurrentEmployee();
  if (!employee) return null;
  if (!canManageRecruitment(employee)) redirect("/dashboard");

  const { id } = await params;
  const posting = findJobPostingById(id);
  if (!posting) notFound();

  const candidateList = getCandidatesForJob(id);

  return (
    <div>
      <BackLink href="/rekrutmen" label="Kembali ke Rekrutmen" />

      <PageHeader
        title={posting.title}
        description={`${DEPARTMENT_LABEL[posting.department]} · ${EMPLOYMENT_TYPE_LABEL[posting.employmentType]}`}
        action={<StatusBadge status={posting.status} />}
      />

      <Card className="mb-5">
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
                    href={c.resumeFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={c.name.replace(/\s+/g, "_") + "_CV"}
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
