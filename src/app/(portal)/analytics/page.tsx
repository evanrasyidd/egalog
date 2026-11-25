import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/current-employee";

export const metadata: Metadata = { title: "Analitik" };
import { employees, attendanceRecords, leaveRequests, payslips } from "@/lib/db";
import { Card, PageHeader } from "@/components/card";
import { ROLE_LEVEL, DEPARTMENT_LABEL } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { getSubordinateIds } from "@/lib/db";
import { canManagePayroll } from "@/lib/permissions";
import { currentPeriod, previousPeriod, todayISO } from "@/lib/date";
import { ReportTabs } from "@/components/report-tabs";

export default async function AnalyticsPage() {
  const employee = await getCurrentEmployee();
  if (!employee) redirect("/login");

  const isManagement = ROLE_LEVEL[employee.role] <= ROLE_LEVEL.manager;
  if (!isManagement) redirect("/dashboard");

  const subordinates = getSubordinateIds(employee.id);
  const canSeeAll = ROLE_LEVEL[employee.role] <= ROLE_LEVEL.direktur;
  const scope = canSeeAll ? employees.filter((e) => e.isActive) : employees.filter((e) => e.isActive && (e.id === employee.id || subordinates.has(e.id)));

  const totalEmployees = scope.length;
  const totalDepartments = new Set(scope.map((e) => e.department)).size;

  const thisMonth = currentPeriod();
  const payrollPeriod = previousPeriod(thisMonth); // bulan berjalan belum ditutup
  const canViewPayroll = canManagePayroll(employee);
  const monthRecords = attendanceRecords.filter((r) => r.date.startsWith(thisMonth));
  const presentToday = attendanceRecords.filter((r) => r.date === todayISO() && r.clockIn).length;
  const lateThisMonth = monthRecords.filter((r) => r.status === "terlambat").length;
  const alphaThisMonth = monthRecords.filter((r) => r.status === "alpha").length;

  const pendingLeaves = leaveRequests.filter((r) => r.status === "menunggu").length;
  const monthlyPayrollTotal = payslips
    .filter((p) => p.period === payrollPeriod)
    .reduce((sum, p) => sum + p.netPay, 0);

  const deptCounts: Record<string, number> = {};
  for (const e of scope) {
    deptCounts[e.department] = (deptCounts[e.department] ?? 0) + 1;
  }

  const roleCounts: Record<string, number> = {};
  for (const e of scope) {
    const label = e.role.charAt(0).toUpperCase() + e.role.slice(1);
    roleCounts[label] = (roleCounts[label] ?? 0) + 1;
  }

  const recentPayrolls = payslips
    .filter((p) => p.period === payrollPeriod)
    .sort((a, b) => b.period.localeCompare(a.period))
    .slice(0, 5);

  return (
    <div>
      <PageHeader title="HR Analytics" description="Ringkasan data perusahaan" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Card>
          <p className="text-xs text-muted-foreground mb-1">Total Karyawan</p>
          <p className="text-3xl font-semibold font-mono">{totalEmployees}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground mb-1">Hadir Hari Ini</p>
          <p className="text-3xl font-semibold font-mono">{presentToday}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground mb-1">Pengajuan Menunggu</p>
          <p className="text-3xl font-semibold font-mono">{pendingLeaves}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground mb-1">Total Departemen</p>
          <p className="text-3xl font-semibold font-mono">{totalDepartments}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <h2 className="text-sm font-medium mb-4">Karyawan per Departemen</h2>
          {Object.entries(deptCounts).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Tidak ada data.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(deptCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([dept, count]) => (
                  <div key={dept}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{DEPARTMENT_LABEL[dept as keyof typeof DEPARTMENT_LABEL] ?? dept}</span>
                      <span className="font-medium font-mono">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(count / totalEmployees) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-medium mb-4">Karyawan per Role</h2>
          {Object.entries(roleCounts).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Tidak ada data.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(roleCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([role, count]) => (
                  <div key={role}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{role}</span>
                      <span className="font-medium font-mono">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${(count / totalEmployees) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <h2 className="text-sm font-medium mb-4">Ringkasan Absensi Bulan Ini</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Record</p>
              <p className="text-xl font-semibold font-mono">{monthRecords.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Terlambat</p>
              <p className="text-xl font-semibold font-mono text-warning">{lateThisMonth}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Alpha</p>
              <p className="text-xl font-semibold font-mono text-danger">{alphaThisMonth}</p>
            </div>
          </div>
        </Card>

        {canViewPayroll && (
          <Card>
            <h2 className="text-sm font-medium mb-4">Payroll {payrollPeriod}</h2>
            {monthlyPayrollTotal > 0 ? (
              <>
                <p className="text-xs text-muted-foreground mb-1">Total Take Home Pay</p>
                <p className="text-2xl font-semibold font-mono">{formatCurrency(monthlyPayrollTotal)}</p>
                <p className="text-xs text-muted-foreground mt-2">Periode terakhir yang sudah ditutup</p>

                <div className="mt-4 space-y-2">
                  {recentPayrolls.map((p) => {
                    const emp = employees.find((e) => e.id === p.employeeId);
                    return (
                      <div key={p.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate">{emp?.name ?? p.employeeId}</span>
                        <span className="font-mono font-medium">{formatCurrency(p.netPay)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Belum ada payroll untuk periode {payrollPeriod}.
              </p>
            )}
          </Card>
        )}
      </div>

      <Card className="mt-5">
        <h2 className="text-sm font-medium mb-4">Laporan & Ekspor</h2>
        <p className="text-xs text-muted-foreground mb-4">Preview data, filter tanggal dari kalender, lalu download CSV.</p>
        <ReportTabs canViewPayroll={canViewPayroll} />
      </Card>
    </div>
  );
}
