import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentEmployee } from "@/lib/current-employee";
import { isDirectManagerOf } from "@/lib/permissions";
import { findEmployeeById } from "@/lib/db";
import { findReviewByEmployeeAndCycle, getGoalsForEmployee } from "@/lib/performance";
import { ROLE_LABEL } from "@/lib/types";
import { Card, PageHeader } from "@/components/card";
import { BackLink } from "@/components/back-link";
import { getCurrentCycle, getCycleOptions, formatCycleLabel } from "@/lib/format";
import { ReviewForm } from "./review-form";
import { GoalManager } from "./goal-manager";

export default async function ReviewEmployeePage({
  params,
  searchParams,
}: {
  params: Promise<{ employeeId: string }>;
  searchParams: Promise<{ cycle?: string }>;
}) {
  const reviewer = await getCurrentEmployee();
  if (!reviewer) return null;

  const { employeeId } = await params;
  const targetEmployee = findEmployeeById(employeeId);
  if (!targetEmployee) notFound();

  if (!isDirectManagerOf(reviewer.id, employeeId)) redirect("/dashboard");

  const cycleOptions = getCycleOptions();
  const { cycle: cycleParam } = await searchParams;
  const cycle = cycleParam && cycleOptions.includes(cycleParam) ? cycleParam : getCurrentCycle();

  const existingReview = findReviewByEmployeeAndCycle(employeeId, cycle) ?? null;
  const goalList = getGoalsForEmployee(employeeId);

  return (
    <div>
      <BackLink href={`/performance/kelola?cycle=${cycle}`} label="Kembali ke Kelola Review" />

      <PageHeader
        title={targetEmployee.name}
        description={`${targetEmployee.jobTitle} · ${ROLE_LABEL[targetEmployee.role]}`}
      />

      <div className="mb-5 flex items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">Siklus:</span>
        {cycleOptions.map((c) => (
          <Link
            key={c}
            href={`/performance/kelola/${employeeId}?cycle=${c}`}
            className={`rounded-[8px] border px-3 py-1.5 text-xs font-medium transition-colors ${
              c === cycle
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-surface hover:bg-surface-muted"
            }`}
          >
            {formatCycleLabel(c)}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <h2 className="text-sm font-medium mb-4">Review {formatCycleLabel(cycle)}</h2>
          <ReviewForm
            employeeId={employeeId}
            cycle={cycle}
            existingReview={
              existingReview
                ? {
                    id: existingReview.id,
                    scores: existingReview.scores,
                    strengths: existingReview.strengths,
                    areasForImprovement: existingReview.areasForImprovement,
                    status: existingReview.status,
                  }
                : null
            }
          />
        </Card>

        <Card>
          <h2 className="text-sm font-medium mb-4">Goal / KPI</h2>
          <GoalManager employeeId={employeeId} cycle={cycle} initialGoals={goalList} />
        </Card>
      </div>
    </div>
  );
}
