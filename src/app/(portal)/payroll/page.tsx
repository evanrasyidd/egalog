import { Download, FileText } from "lucide-react";
import { getCurrentEmployee } from "@/lib/current-employee";
import { getPayslipsForEmployee } from "@/lib/payroll";
import { Card, PageHeader } from "@/components/card";
import { formatCurrency, formatPeriodLabel } from "@/lib/format";

export default async function PayrollPage() {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  const payslips = getPayslipsForEmployee(employee.id);

  return (
    <div>
      <PageHeader
        title="Payroll"
        description="Riwayat slip gaji kamu. Perhitungan BPJS & PPh21 adalah estimasi untuk keperluan demo."
      />

      {payslips.length === 0 ? (
        <Card>
          <div className="py-10 text-center">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-3" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">
              Belum ada slip gaji. Slip akan muncul di sini setelah Finance men-generate
              payroll untuk suatu periode.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {payslips.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium capitalize">
                    {formatPeriodLabel(p.period)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.attendance.presentDays}/{p.attendance.workingDays} hari hadir ·{" "}
                    {p.attendance.lateDays} telat · {p.attendance.alphaDays} alpha
                  </p>
                </div>
                <a
                  href={`/api/payroll/${p.id}/pdf`}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-muted transition-colors shrink-0"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Unduh PDF
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm border-t border-border pt-3">
                <div className="flex justify-between sm:block">
                  <span className="text-muted-foreground text-xs">Gaji Pokok</span>
                  <p className="font-mono">{formatCurrency(p.earnings.baseSalary)}</p>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="text-muted-foreground text-xs">Tunjangan</span>
                  <p className="font-mono">
                    {formatCurrency(
                      p.earnings.allowanceTransport +
                        p.earnings.allowanceMeal +
                        p.earnings.allowancePosition,
                    )}
                  </p>
                </div>
                {p.earnings.overtimePay > 0 && (
                  <div className="flex justify-between sm:block">
                    <span className="text-muted-foreground text-xs">
                      Lembur ({p.earnings.overtimeHours}j)
                    </span>
                    <p className="font-mono">{formatCurrency(p.earnings.overtimePay)}</p>
                  </div>
                )}
                <div className="flex justify-between sm:block">
                  <span className="text-muted-foreground text-xs">Total Potongan</span>
                  <p className="font-mono text-danger">
                    - {formatCurrency(p.totalDeductions)}
                  </p>
                </div>
                <div className="flex justify-between sm:block col-span-2 sm:col-span-1">
                  <span className="text-muted-foreground text-xs">Gaji Bersih</span>
                  <p className="font-mono font-semibold text-base">
                    {formatCurrency(p.netPay)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
