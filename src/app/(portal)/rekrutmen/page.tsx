import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Users, ChevronRight, MapPin } from "lucide-react";
import { getCurrentEmployee } from "@/lib/current-employee";
import { canManageRecruitment } from "@/lib/permissions";

export const metadata: Metadata = { title: "Rekrutmen" };
import { getAllJobPostings, getOpenJobPostings, getCandidateCountsByJob } from "@/lib/recruitment";
import { DEPARTMENT_LABEL, type Department } from "@/lib/types";
import { Card, PageHeader } from "@/components/card";
import { StatusBadge } from "@/components/status-badge";
import { JobPostingForm } from "@/components/job-posting-form";
import { JobStatusToggle } from "@/components/job-status-toggle";
import { EMPLOYMENT_TYPE_LABEL, WORK_ARRANGEMENT_LABEL } from "@/lib/labels";

export default async function RekrutmenPage() {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  const canManageAny = canManageRecruitment(employee);
  const postings = canManageAny ? getAllJobPostings() : getOpenJobPostings();
  const candidateCounts = canManageAny ? getCandidateCountsByJob() : {};

  const manageableDepartments = (Object.keys(DEPARTMENT_LABEL) as Department[]).filter(
    (department) => canManageRecruitment(employee, department),
  );

  return (
    <div>
      <PageHeader
        title="Rekrutmen"
        description={
          canManageAny
            ? "Kelola lowongan & pipeline kandidat."
            : "Lowongan internal yang sedang dibuka."
        }
        action={
          canManageAny ? <JobPostingForm allowedDepartments={manageableDepartments} /> : undefined
        }
      />

      {postings.length === 0 ? (
        <Card>
          <div className="py-10 text-center">
            <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-3" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">
              {canManageAny ? "Belum ada lowongan dibuat." : "Belum ada lowongan yang dibuka."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {postings.map((job) => {
            const canManage = canManageRecruitment(employee, job.department);
            return (
              <Card key={job.id} className="hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <Link
                      href={`/rekrutmen/${job.id}`}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {job.title}
                    </Link>
                    <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <span>{DEPARTMENT_LABEL[job.department]}</span>
                      <span aria-hidden="true">·</span>
                      <span>{EMPLOYMENT_TYPE_LABEL[job.employmentType]}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" strokeWidth={1.75} />
                        {job.location}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{WORK_ARRANGEMENT_LABEL[job.workArrangement]}</span>
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-sm text-foreground/80 line-clamp-2">{job.description}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    {canManage ? (
                      <>
                        <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {candidateCounts[job.id] ?? 0} kandidat
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {job.location}
                      </>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    {canManage && <JobStatusToggle jobId={job.id} status={job.status} />}
                    <Link
                      href={`/rekrutmen/${job.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Lihat detail
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
