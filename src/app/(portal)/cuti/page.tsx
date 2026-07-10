import { getCurrentEmployee } from "@/lib/current-employee";
import { getRequestsForEmployees } from "@/lib/leave";
import { findEmployeeById } from "@/lib/db";
import { ROLE_LABEL } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { Card, PageHeader } from "@/components/card";
import { LeaveForm } from "./leave-form";

const TYPE_LABEL: Record<string, string> = {
  cuti_tahunan: "Cuti Tahunan",
  sakit: "Sakit",
  izin: "Izin",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function CutiPage() {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  const requests = getRequestsForEmployees([employee.id]);

  return (
    <div>
      <PageHeader
        title="Cuti & Izin"
        description={`Sisa saldo cuti tahunan: ${employee.leaveBalance} hari.`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 h-fit">
          <h2 className="text-sm font-medium mb-4">Ajukan Baru</h2>
          <LeaveForm />
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-sm font-medium mb-4">Riwayat Pengajuan</h2>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Belum ada pengajuan cuti/izin.
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="rounded-[10px] border border-border p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-medium">{TYPE_LABEL[r.type]}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(r.startDate)} — {formatDate(r.endDate)}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-sm text-foreground/80 mb-2">{r.reason}</p>
                  {r.approvalChain.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      {r.approvalChain.map((step, i) => {
                        const approver = findEmployeeById(step.approverId);
                        return (
                          <span
                            key={i}
                            className="text-xs text-muted-foreground flex items-center gap-1"
                          >
                            {approver?.name} ({ROLE_LABEL[step.approverRole]})
                            <StatusBadge status={step.decision} />
                            {i < r.approvalChain.length - 1 && (
                              <span className="mx-1">→</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
