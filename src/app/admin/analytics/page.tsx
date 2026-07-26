import type { Metadata } from "next";
import { employees, attendanceRecords, leaveRequests, payslips } from "@/lib/db";
import { Card, PageHeader } from "@/components/card";
import { DEPARTMENT_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "Admin • Analitik" };
import { formatCurrency } from "@/lib/format";

export default async function AdminAnalyticsPage() {
  const activeEmployees = employees.filter((e) => e.isActive);
  const totalEmployees = activeEmployees.length;
  const totalDepartments = new Set(activeEmployees.map((e) => e.department)).size;

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthRecords = attendanceRecords.filter((r) => r.date.startsWith(thisMonth));
  const presentToday = attendanceRecords.filter((r) => r.date === new Date().toISOString().slice(0, 10) && r.clockIn).length;
  const lateThisMonth = monthRecords.filter((r) => r.status === "terlambat").length;
  const alphaThisMonth = monthRecords.filter((r) => r.status === "alpha").length;

  const pendingLeaves = leaveRequests.filter((r) => r.status === "menunggu").length;
  const monthlyPayrollTotal = payslips
    .filter((p) => p.period === thisMonth)
    .reduce((sum, p) => sum + p.netPay, 0);

  const deptCounts: Record<string, number> = {};
  for (const e of activeEmployees) {
    deptCounts[e.department] = (deptCounts[e.department] ?? 0) + 1;
  }

  const roleCounts: Record<string, number> = {};
  for (const e of activeEmployees) {
    const label = e.role.charAt(0).toUpperCase() + e.role.slice(1);
    roleCounts[label] = (roleCounts[label] ?? 0) + 1;
  }

  const recentPayrolls = [...payslips].sort((a, b) => b.period.localeCompare(a.period)).slice(0, 5);

  return (
    <div>
      <PageHeader title="HR Analytics" description="Ringkasan data perusahaan" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Card>
          <p className="text-xs text-muted-foreground mb-1">Total Karyawan Aktif</p>
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

        <Card>
          <h2 className="text-sm font-medium mb-4">Payroll Bulan Ini</h2>
          {monthlyPayrollTotal > 0 ? (
            <>
              <p className="text-xs text-muted-foreground mb-1">Total Take Home Pay</p>
              <p className="text-2xl font-semibold font-mono">{formatCurrency(monthlyPayrollTotal)}</p>
              <p className="text-xs text-muted-foreground mt-2 capitalize">{thisMonth}</p>
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
            <p className="text-sm text-muted-foreground py-4 text-center">Belum ada payroll bulan ini.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
