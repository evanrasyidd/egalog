import Link from "next/link";
import { Briefcase, Users, ChevronRight } from "lucide-react";
import { getAllJobPostings, getCandidateCountsByJob } from "@/lib/recruitment";
import { DEPARTMENT_LABEL } from "@/lib/types";
import { Card, PageHeader } from "@/components/card";
import { StatusBadge } from "@/components/status-badge";
import { JobPostingForm } from "@/components/job-posting-form";
import { JobStatusToggle } from "@/components/job-status-toggle";

const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  full_time: "Full-time",
  kontrak: "Kontrak",
  magang: "Magang",
};

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
            <Link key={job.id} href={`/admin/rekrutmen/${job.id}`} className="block">
              <Card className="hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {DEPARTMENT_LABEL[job.department]} · {EMPLOYMENT_TYPE_LABEL[job.employmentType]}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-sm text-foreground/80 line-clamp-2">{job.description}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {candidateCounts[job.id] ?? 0} kandidat
                  </span>
                  <div className="flex items-center gap-2">
                    <JobStatusToggle jobId={job.id} status={job.status} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
