import "server-only";
import { jobPostings, candidates, nextJobId, nextCandidateId } from "./db";
import type { JobPosting, Candidate, EmploymentType, Department, CandidateStage } from "./types";

export function createJobPosting(
  createdBy: string,
  title: string,
  department: Department,
  employmentType: EmploymentType,
  description: string,
  requirements: string,
): JobPosting {
  const posting: JobPosting = {
    id: nextJobId(),
    title,
    department,
    employmentType,
    description,
    requirements,
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

export function getOpenJobPostings(): JobPosting[] {
  return jobPostings
    .filter((j) => j.status === "dibuka")
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
): AddCandidateResult {
  if (!findJobPostingById(jobPostingId)) return { ok: false, error: "job_not_found" };

  const candidate: Candidate = {
    id: nextCandidateId(),
    jobPostingId,
    name,
    email,
    phone,
    resumeNote,
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
