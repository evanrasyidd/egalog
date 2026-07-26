import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/current-employee";

export const metadata: Metadata = { title: "Approval" };
import { getPendingApprovalsFor } from "@/lib/leave";
import { findEmployeeById } from "@/lib/db";
import { ROLE_LEVEL } from "@/lib/types";
import { Card, PageHeader } from "@/components/card";
import { ApprovalHubClient } from "./approval-hub-client";

export default async function ApprovalPage() {
  const employee = await getCurrentEmployee();
  if (!employee) redirect("/login");

  const isApproverLevel = ROLE_LEVEL[employee.role] <= ROLE_LEVEL.supervisor;
  if (!isApproverLevel) redirect("/dashboard");

  const pendingLeave = getPendingApprovalsFor(employee.id);

  const items = pendingLeave.map((r) => {
    const person = findEmployeeById(r.employeeId);
    return {
      id: r.id,
      type: "cuti" as const,
      employeeName: person?.name ?? r.employeeId,
      typeLabel: r.type === "cuti_tahunan" ? "Cuti Tahunan" : r.type === "sakit" ? "Sakit" : "Izin",
      startDate: r.startDate,
      endDate: r.endDate,
      reason: r.reason,
    };
  });

  return (
    <div>
      <PageHeader
        title="Approval Hub"
        description={items.length > 0 ? `${items.length} menunggu keputusanmu` : "Tidak ada yang menunggu"}
      />
      <Card>
        <ApprovalHubClient initialItems={items} />
      </Card>
    </div>
  );
}
