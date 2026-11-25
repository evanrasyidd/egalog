import "server-only";
import { jobPostings, candidates, nextJobId, nextCandidateId } from "./db";
import { todayISO } from "./date";
import type {
  JobPosting,
  Candidate,
  EmploymentType,
  Department,
  CandidateStage,
  WorkArrangement,
} from "./types";

export interface CreateJobInput {
  title: string;
  department: Department;
  employmentType: EmploymentType;
  description: string;
  requirements: string;
  location?: string;
  workArrangement?: WorkArrangement;
  salaryRange?: string | null;
  deadline?: string | null;
}

export function createJobPosting(createdBy: string, input: CreateJobInput): JobPosting {
  const posting: JobPosting = {
    id: nextJobId(),
    title: input.title,
    department: input.department,
    employmentType: input.employmentType,
    description: input.description,
    requirements: input.requirements,
    location: input.location ?? "Depok, Jawa Barat",
    workArrangement: input.workArrangement ?? "onsite",
    salaryRange: input.salaryRange ?? null,
    deadline: input.deadline ?? null,
    status: "dibuka",
    createdBy,
    createdAt: new Date().toISOString(),
  };
  jobPostings.push(posting);
  return posting;
}

export type ToggleJobStatusResult =
  | { ok: true; posting: JobPosting }
  | { ok: false; error: "not_found" };

export function toggleJobStatus(jobId: string): ToggleJobStatusResult {
  const posting = jobPostings.find((j) => j.id === jobId);
  if (!posting) return { ok: false, error: "not_found" };
  posting.status = posting.status === "dibuka" ? "ditutup" : "dibuka";
  return { ok: true, posting };
}

/** Lowongan yang benar-benar masih menerima lamaran (status + deadline). */
export function isJobOpen(job: JobPosting): boolean {
  if (job.status !== "dibuka") return false;
  if (!job.deadline) return true;
  return job.deadline >= todayISO();
}

export function getOpenJobPostings(): JobPosting[] {
  return jobPostings
    .filter(isJobOpen)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAllJobPostings(): JobPosting[] {
  return [...jobPostings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function findJobPostingById(id: string): JobPosting | undefined {
  return jobPostings.find((j) => j.id === id);
}

export type AddCandidateResult =
  | { ok: true; candidate: Candidate }
  | { ok: false; error: "job_not_found" };

export function addCandidate(
  jobPostingId: string,
  addedBy: string,
  name: string,
  email: string,
  phone: string,
  resumeNote: string,
  resumeFile: string | null = null,
  consentAt: string | null = null,
): AddCandidateResult {
  if (!findJobPostingById(jobPostingId)) return { ok: false, error: "job_not_found" };

  const candidate: Candidate = {
    id: nextCandidateId(),
    jobPostingId,
    name,
    email,
    phone,
    resumeNote,
    resumeFile,
    consentAt,
    stage: "lamar",
    notes: "",
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: addedBy,
  };
  candidates.push(candidate);
  return { ok: true, candidate };
}

export type UpdateCandidateResult =
  | { ok: true; candidate: Candidate }
  | { ok: false; error: "not_found" };

export function updateCandidateStage(
  candidateId: string,
  updatedBy: string,
  stage: CandidateStage,
  notes?: string,
): UpdateCandidateResult {
  const candidate = candidates.find((c) => c.id === candidateId);
  if (!candidate) return { ok: false, error: "not_found" };

  candidate.stage = stage;
  if (notes !== undefined) candidate.notes = notes;
  candidate.updatedAt = new Date().toISOString();
  candidate.updatedBy = updatedBy;
  return { ok: true, candidate };
}

export function getCandidatesForJob(jobPostingId: string): Candidate[] {
  return candidates
    .filter((c) => c.jobPostingId === jobPostingId)
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
}

export function getCandidateCountsByJob(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of candidates) {
    counts[c.jobPostingId] = (counts[c.jobPostingId] ?? 0) + 1;
  }
  return counts;
}

export function findCandidateById(id: string): Candidate | undefined {
  return candidates.find((c) => c.id === id);
}

/** Lowongan pemilik seorang kandidat — dipakai untuk cek scope departemen. */
export function findJobPostingForCandidate(candidateId: string): JobPosting | undefined {
  const candidate = findCandidateById(candidateId);
  return candidate ? findJobPostingById(candidate.jobPostingId) : undefined;
}
