import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/current-employee";
import { getPendingApprovalsFor } from "@/lib/leave";
import { findEmployeeById } from "@/lib/db";
import { ROLE_LEVEL } from "@/lib/types";

export async function GET() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const isApproverLevel = ROLE_LEVEL[employee.role] <= ROLE_LEVEL.supervisor;

  const pendingLeave = isApproverLevel ? getPendingApprovalsFor(employee.id) : [];
  const items = pendingLeave.map((r) => {
    const person = findEmployeeById(r.employeeId);
    return {
      id: r.id,
      type: "cuti" as const,
      title: `Cuti: ${person?.name ?? r.employeeId}`,
      description: `${r.startDate} — ${r.endDate}`,
      link: "/cuti/approval",
      createdAt: r.createdAt,
    };
  });

  return NextResponse.json({ approvals: items });
}
