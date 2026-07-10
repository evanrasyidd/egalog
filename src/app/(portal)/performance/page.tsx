import { Target, ClipboardList } from "lucide-react";
import { getCurrentEmployee } from "@/lib/current-employee";
import { getFinalReviewsForEmployee, getGoalsForEmployee } from "@/lib/performance";
import { COMPETENCIES, COMPETENCY_LABEL } from "@/lib/types";
import { Card, PageHeader } from "@/components/card";
import { ScoreBar } from "@/components/score-bar";
import { formatCycleLabel } from "@/lib/format";
import { GoalStatusSelect } from "./goal-status-select";

export default async function PerformancePage() {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  const reviews = getFinalReviewsForEmployee(employee.id);
  const goalList = getGoalsForEmployee(employee.id);

  return (
    <div>
      <PageHeader
        title="Performance Review"
        description="Riwayat penilaian kinerja & progress goal kamu."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <h2 className="text-sm font-medium flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            Riwayat Review
          </h2>
          {reviews.length === 0 ? (
            <Card>
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada review yang final untuk kamu.
              </p>
            </Card>
          ) : (
            reviews.map((r) => (
              <Card key={r.id}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">{formatCycleLabel(r.cycle)}</p>
                  <span className="text-lg font-mono font-semibold">{r.overallScore}/5</span>
                </div>
                <div className="space-y-2.5 mb-4">
                  {COMPETENCIES.map((c) => (
                    <ScoreBar key={c} label={COMPETENCY_LABEL[c]} score={r.scores[c]} />
                  ))}
                </div>
                <div className="space-y-2 text-sm border-t border-border pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Kekuatan</p>
                    <p>{r.strengths}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Area Pengembangan</p>
                    <p>{r.areasForImprovement}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            Goal / KPI
          </h2>
          {goalList.length === 0 ? (
            <Card>
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada goal yang ditetapkan atasanmu.
              </p>
            </Card>
          ) : (
            <Card>
              <div className="space-y-4">
                {goalList.map((g) => (
                  <div key={g.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div>
                        <p className="text-sm font-medium">{g.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCycleLabel(g.cycle)}
                        </p>
                      </div>
                    </div>
                    {g.description && (
                      <p className="text-sm text-foreground/80 mb-2">{g.description}</p>
                    )}
                    <GoalStatusSelect goalId={g.id} currentStatus={g.status} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
