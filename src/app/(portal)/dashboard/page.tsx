import Link from "next/link";
import { CalendarDays, Users, ClipboardCheck, ArrowRight, Wallet, TrendingUp } from "lucide-react";
import { getCurrentEmployee } from "@/lib/current-employee";
import { getTodayRecord } from "@/lib/attendance";
import { getPendingApprovalsFor } from "@/lib/leave";
import { getPayslipsForEmployee } from "@/lib/payroll";
import { getFinalReviewsForEmployee } from "@/lib/performance";
import { getDirectReports, getSubordinateIds, OFFICE_LOCATION } from "@/lib/db";
import { getManageablePerformanceEmployees } from "@/lib/permissions";
import { ROLE_LEVEL, ROLE_LABEL } from "@/lib/types";
import { AttendanceWidget } from "@/components/attendance-widget";
import { Card, PageHeader } from "@/components/card";
import { TeamScoreChart } from "@/components/team-score-chart";
import { formatCurrency, formatPeriodLabel, formatCycleLabel } from "@/lib/format";

export default async function DashboardPage() {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  const todayRecord = getTodayRecord(employee.id) ?? null;
  const isApproverLevel = ROLE_LEVEL[employee.role] <= ROLE_LEVEL.supervisor;
  const pendingApprovals = isApproverLevel ? getPendingApprovalsFor(employee.id) : [];
  const directReports = getDirectReports(employee.id);
  const subordinateIds = getSubordinateIds(employee.id);
  const manageableTeam = getManageablePerformanceEmployees(employee);
  const teamScoreEntries = manageableTeam
    .map((m) => ({
      name: m.name,
      score: getFinalReviewsForEmployee(m.id)[0]?.overallScore ?? null,
    }))
    .sort((a, b) => (a.score ?? -1) - (b.score ?? -1))
    .slice(0, 8);
  const latestPayslip = getPayslipsForEmployee(employee.id)[0] ?? null;
  const latestReview = getFinalReviewsForEmployee(employee.id)[0] ?? null;

  return (
    <div>
      <PageHeader
        title={`Halo, ${employee.name.split(" ")[0]}`}
        description={`${ROLE_LABEL[employee.role]} · ${employee.jobTitle}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-medium mb-4">Absensi Hari Ini</h2>
          <AttendanceWidget initialRecord={todayRecord} officeLabel={OFFICE_LOCATION.label} />
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
              <p className="text-xs font-medium">Saldo Cuti Tahunan</p>
            </div>
            <p className="text-3xl font-semibold font-mono">{employee.leaveBalance} hari</p>
            <Link
              href="/cuti"
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Ajukan cuti/izin <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </Card>

          <Card>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Wallet className="h-4 w-4" strokeWidth={1.75} />
              <p className="text-xs font-medium">Slip Gaji Terakhir</p>
            </div>
            {latestPayslip ? (
              <>
                <p className="text-2xl font-semibold font-mono">
                  {formatCurrency(latestPayslip.netPay)}
                </p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">
                  {formatPeriodLabel(latestPayslip.period)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada slip gaji.</p>
            )}
            <Link
              href="/payroll"
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Lihat riwayat <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </Card>

          <Card>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
              <p className="text-xs font-medium">Review Terakhir</p>
            </div>
            {latestReview ? (
              <>
                <p className="text-2xl font-semibold font-mono">
                  {latestReview.overallScore}/5
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatCycleLabel(latestReview.cycle)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada review final.</p>
            )}
            <Link
              href="/performance"
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Lihat detail <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </Card>

          {isApproverLevel && (
            <Card>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <ClipboardCheck className="h-4 w-4" strokeWidth={1.75} />
                <p className="text-xs font-medium">Menunggu Persetujuanmu</p>
              </div>
              <p className="text-3xl font-semibold font-mono">{pendingApprovals.length}</p>
              <Link
                href="/cuti/approval"
                className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Lihat pengajuan <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </Card>
          )}

          {directReports.length > 0 || subordinateIds.size > 0 ? (
            <Card>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users className="h-4 w-4" strokeWidth={1.75} />
                <p className="text-xs font-medium">Bawahan &amp; Tim</p>
              </div>
              <p className="text-3xl font-semibold font-mono">
                {directReports.length}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  langsung · {subordinateIds.size} tim
                </span>
              </p>
              <Link
                href="/karyawan"
                className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Lihat tim <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </Card>
          ) : null}
        </div>
      </div>

      {manageableTeam.length > 0 && (
        <Card className="mt-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
              <p className="text-xs font-medium">
                Skor Review Terakhir Tim{manageableTeam.length > 8 ? " (8 terendah)" : ""}
              </p>
            </div>
            <Link
              href="/performance/kelola"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Kelola semua <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </div>
          <TeamScoreChart entries={teamScoreEntries} />
        </Card>
      )}
    </div>
  );
}
