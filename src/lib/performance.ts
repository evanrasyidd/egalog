import "server-only";
import { performanceReviews, goals, findEmployeeById, nextReviewId, nextGoalId } from "./db";
import { canManagePerformanceFor } from "./permissions";
import { COMPETENCIES } from "./types";
import type { PerformanceReview, Goal, Competency, GoalStatus } from "./types";

const CYCLE_REGEX = /^\d{4}-Q[1-4]$/;

export function isValidCycle(cycle: string): boolean {
  return CYCLE_REGEX.test(cycle);
}

function computeOverallScore(scores: Record<Competency, number>): number {
  const values = COMPETENCIES.map((c) => scores[c]);
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

export type SaveDraftResult =
  | { ok: true; review: PerformanceReview }
  | {
      ok: false;
      error: "invalid_cycle" | "not_direct_manager" | "employee_not_found" | "already_final";
    };

/**
 * Simpan/update draft review. Kalau review untuk employeeId+cycle ini sudah
 * ada dan masih draft, di-update. Kalau sudah "selesai" (final), tidak bisa
 * diedit lagi lewat fungsi ini — final review bersifat immutable.
 */
export function saveDraftReview(
  reviewerId: string,
  employeeId: string,
  cycle: string,
  scores: Record<Competency, number>,
  strengths: string,
  areasForImprovement: string,
): SaveDraftResult {
  if (!isValidCycle(cycle)) return { ok: false, error: "invalid_cycle" };
  if (!findEmployeeById(employeeId)) return { ok: false, error: "employee_not_found" };
  if (!canManagePerformanceFor(reviewerId, employeeId)) {
    return { ok: false, error: "not_direct_manager" };
  }

  const overallScore = computeOverallScore(scores);
  const existing = performanceReviews.find(
    (r) => r.employeeId === employeeId && r.cycle === cycle,
  );

  if (existing) {
    if (existing.status === "selesai") return { ok: false, error: "already_final" };
    existing.reviewerId = reviewerId;
    existing.scores = scores;
    existing.overallScore = overallScore;
    existing.strengths = strengths;
    existing.areasForImprovement = areasForImprovement;
    return { ok: true, review: existing };
  }

  const review: PerformanceReview = {
    id: nextReviewId(),
    employeeId,
    reviewerId,
    cycle,
    scores,
    overallScore,
    strengths,
    areasForImprovement,
    status: "draft",
    createdAt: new Date().toISOString(),
    submittedAt: null,
  };
  performanceReviews.push(review);
  return { ok: true, review };
}

export type SubmitReviewResult =
  | { ok: true; review: PerformanceReview }
  | { ok: false; error: "not_found" | "not_reviewer" | "already_final" };

export function submitReview(reviewId: string, reviewerId: string): SubmitReviewResult {
  const review = performanceReviews.find((r) => r.id === reviewId);
  if (!review) return { ok: false, error: "not_found" };
  if (review.reviewerId !== reviewerId) return { ok: false, error: "not_reviewer" };
  if (review.status === "selesai") return { ok: false, error: "already_final" };

  review.status = "selesai";
  review.submittedAt = new Date().toISOString();
  return { ok: true, review };
}

export function getFinalReviewsForEmployee(employeeId: string): PerformanceReview[] {
  return performanceReviews
    .filter((r) => r.employeeId === employeeId && r.status === "selesai")
    .sort((a, b) => b.cycle.localeCompare(a.cycle));
}

/** Semua review (draft & selesai) untuk 1 karyawan — dipakai reviewer, bukan employee sendiri. */
export function getAllReviewsForEmployee(employeeId: string): PerformanceReview[] {
  return performanceReviews
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => b.cycle.localeCompare(a.cycle));
}

export function findReviewByEmployeeAndCycle(
  employeeId: string,
  cycle: string,
): PerformanceReview | undefined {
  return performanceReviews.find((r) => r.employeeId === employeeId && r.cycle === cycle);
}

// ---------------------------------------------------------------------------
// Goals / KPI
// ---------------------------------------------------------------------------

export type CreateGoalResult =
  | { ok: true; goal: Goal }
  | { ok: false; error: "not_direct_manager" | "employee_not_found" };

export function createGoal(
  createdBy: string,
  employeeId: string,
  cycle: string,
  title: string,
  description: string,
): CreateGoalResult {
  if (!findEmployeeById(employeeId)) return { ok: false, error: "employee_not_found" };
  if (!canManagePerformanceFor(createdBy, employeeId)) {
    return { ok: false, error: "not_direct_manager" };
  }

  const goal: Goal = {
    id: nextGoalId(),
    employeeId,
    cycle,
    title,
    description,
    status: "belum_mulai",
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  goals.push(goal);
  return { ok: true, goal };
}

export type UpdateGoalStatusResult =
  | { ok: true; goal: Goal }
  | { ok: false; error: "not_found" | "forbidden" };

/** Status goal boleh diupdate oleh pemilik goal sendiri ATAU atasan langsungnya. */
export function updateGoalStatus(
  goalId: string,
  actorId: string,
  status: GoalStatus,
): UpdateGoalStatusResult {
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return { ok: false, error: "not_found" };

  const isOwner = goal.employeeId === actorId;
  const isManager = canManagePerformanceFor(actorId, goal.employeeId);
  if (!isOwner && !isManager) return { ok: false, error: "forbidden" };

  goal.status = status;
  goal.updatedAt = new Date().toISOString();
  return { ok: true, goal };
}

export function getGoalsForEmployee(employeeId: string): Goal[] {
  return goals
    .filter((g) => g.employeeId === employeeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
