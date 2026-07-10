import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCurrentEmployee } from "@/lib/current-employee";
import { getDirectReports } from "@/lib/db";
import { findReviewByEmployeeAndCycle } from "@/lib/performance";
import { Card, PageHeader } from "@/components/card";
import { StatusBadge } from "@/components/status-badge";
import { getCurrentCycle, getCycleOptions, formatCycleLabel } from "@/lib/format";

export default async function KelolaPerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ cycle?: string }>;
}) {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  const directReports = getDirectReports(employee.id);
  if (directReports.length === 0) redirect("/dashboard");

  const cycleOptions = getCycleOptions();
  const { cycle: cycleParam } = await searchParams;
  const cycle = cycleParam && cycleOptions.includes(cycleParam) ? cycleParam : getCurrentCycle();

  const rows = directReports
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((person) => ({
      person,
      review: findReviewByEmployeeAndCycle(person.id, cycle) ?? null,
    }));

  return (
    <div>
      <PageHeader
        title="Kelola Performance Review"
        description={`Review anggota tim langsungmu untuk ${formatCycleLabel(cycle)}.`}
      />

      <div className="mb-5 flex gap-2">
        {cycleOptions.map((c) => (
          <Link
            key={c}
            href={`/performance/kelola?cycle=${c}`}
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

      <Card>
        <div className="divide-y divide-border">
          {rows.map(({ person, review }) => (
            <Link
              key={person.id}
              href={`/performance/kelola/${person.id}?cycle=${cycle}`}
              className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0 hover:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                  style={{ backgroundColor: person.avatarColor }}
                  aria-hidden="true"
                >
                  {person.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                </span>
                <div>
                  <p className="text-sm font-medium">{person.name}</p>
                  <p className="text-xs text-muted-foreground">{person.jobTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {review ? (
                  <StatusBadge status={review.status} />
                ) : (
                  <span className="text-xs text-muted-foreground">Belum diisi</span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
