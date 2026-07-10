import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/current-employee";
import { getPendingApprovalsFor } from "@/lib/leave";
import { findEmployeeById } from "@/lib/db";
import { ROLE_LEVEL } from "@/lib/types";
import { Card, PageHeader } from "@/components/card";
import { ApprovalList } from "./approval-list";

export default async function CutiApprovalPage() {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  const isApproverLevel = ROLE_LEVEL[employee.role] <= ROLE_LEVEL.supervisor;
  if (!isApproverLevel) redirect("/dashboard");

  const requests = getPendingApprovalsFor(employee.id);
  const employeeNames: Record<string, string> = {};
  for (const r of requests) {
    const person = findEmployeeById(r.employeeId);
    if (person) employeeNames[r.employeeId] = person.name;
  }

  return (
    <div>
      <PageHeader
        title="Approval Cuti"
        description="Pengajuan cuti/izin dari bawahanmu yang menunggu keputusan."
      />
      <Card>
        <ApprovalList requests={requests} employeeNames={employeeNames} />
      </Card>
    </div>
  );
}
