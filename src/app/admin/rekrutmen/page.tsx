import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Users, ChevronRight, MapPin } from "lucide-react";
import { getAllJobPostings, getCandidateCountsByJob } from "@/lib/recruitment";

export const metadata: Metadata = { title: "Admin • Rekrutmen" };
import { DEPARTMENT_LABEL } from "@/lib/types";
import { EMPLOYMENT_TYPE_LABEL, WORK_ARRANGEMENT_LABEL } from "@/lib/labels";
import { Card, PageHeader } from "@/components/card";
import { StatusBadge } from "@/components/status-badge";
import { JobPostingForm } from "@/components/job-posting-form";
import { JobStatusToggle } from "@/components/job-status-toggle";

export default async function AdminRekrutmenPage() {
  const postings = getAllJobPostings();
  const candidateCounts = getCandidateCountsByJob();

  return (
    <div>
      <PageHeader
        title="Kelola Rekrutmen"
        description="Kelola lowongan & pipeline kandidat."
        action={<JobPostingForm />}
      />

      {postings.length === 0 ? (
        <Card>
          <div className="py-10 text-center">
            <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-3" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Belum ada lowongan dibuat.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {postings.map((job) => (
            <Card key={job.id} className="hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <Link
                    href={`/admin/rekrutmen/${job.id}`}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {job.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {DEPARTMENT_LABEL[job.department]} ·{" "}
                    {EMPLOYMENT_TYPE_LABEL[job.employmentType]} ·{" "}
                    {WORK_ARRANGEMENT_LABEL[job.workArrangement]}
                  </p>
                </div>
                <StatusBadge status={job.status} />
              </div>
              <p className="text-sm text-foreground/80 line-clamp-2">{job.description}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {candidateCounts[job.id] ?? 0} kandidat
                  <span aria-hidden="true">·</span>
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {job.location}
                </span>
                <div className="flex items-center gap-2">
                  <JobStatusToggle jobId={job.id} status={job.status} />
                  <Link
                    href={`/admin/rekrutmen/${job.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Detail
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
