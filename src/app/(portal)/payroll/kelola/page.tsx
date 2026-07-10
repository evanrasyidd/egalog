import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/current-employee";
import { canManagePayroll } from "@/lib/permissions";
import { getPayslipsForPeriod } from "@/lib/payroll";
import { employees } from "@/lib/db";
import { Card, PageHeader } from "@/components/card";
import { PayrollManager } from "@/components/payroll-manager";

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function KelolaPayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  if (!canManagePayroll(employee)) redirect("/dashboard");

  const { period: periodParam } = await searchParams;
  const period = periodParam && /^\d{4}-\d{2}$/.test(periodParam) ? periodParam : currentPeriod();

  const periodPayslips = getPayslipsForPeriod(period);
  const payslipByEmployee = new Map(periodPayslips.map((p) => [p.employeeId, p]));

  const rows = employees
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => {
      const payslip = payslipByEmployee.get(e.id);
      return {
        id: e.id,
        name: e.name,
        jobTitle: e.jobTitle,
        nip: e.nip,
        payslipId: payslip?.id ?? null,
        netPay: payslip?.netPay ?? null,
      };
    });

  return (
    <div>
      <PageHeader
        title="Kelola Payroll"
        description="Generate slip gaji bulanan untuk seluruh karyawan. Perhitungan otomatis dari data absensi & cuti yang disetujui."
      />
      <Card>
        <PayrollManager initialPeriod={period} rows={rows} />
      </Card>
    </div>
  );
}
