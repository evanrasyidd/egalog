import type { Metadata } from "next";
import { getPayslipsForPeriod } from "@/lib/payroll";
import { employees } from "@/lib/db";
import { currentPeriod, isPeriodClosed, previousPeriod } from "@/lib/date";
import { Card, PageHeader } from "@/components/card";

export const metadata: Metadata = { title: "Admin • Payroll" };
import { PayrollManager } from "@/components/payroll-manager";

export default async function AdminPayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period =
    periodParam && /^\d{4}-\d{2}$/.test(periodParam)
      ? periodParam
      : previousPeriod(currentPeriod());

  const periodPayslips = getPayslipsForPeriod(period);
  const payslipByEmployee = new Map(periodPayslips.map((p) => [p.employeeId, p]));

  const rows = employees
    .filter((e) => e.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => {
      const payslip = payslipByEmployee.get(e.id);
      return {
        id: e.id,
        name: e.name,
        jobTitle: e.jobTitle,
        nip: e.nip,
        department: e.department,
        payslipId: payslip?.id ?? null,
        netPay: payslip?.netPay ?? null,
      };
    });

  return (
    <div>
      <PageHeader
        title="Kelola Payroll"
        description="Generate slip gaji setelah periode selesai. Perhitungan otomatis dari absensi, cuti disetujui, dan kalender hari libur."
      />
      <Card>
        <PayrollManager
          key={period}
          initialPeriod={period}
          rows={rows}
          canGenerate={isPeriodClosed(period)}
        />
      </Card>
    </div>
  );
}
