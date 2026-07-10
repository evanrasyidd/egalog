import { NextResponse } from "next/server";
import { getCurrentActor, actorHasPermission } from "@/lib/current-actor";
import { canManagePayroll } from "@/lib/permissions";
import { findPayslipById } from "@/lib/payroll";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const payslip = findPayslipById(id);
  if (!payslip) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const isOwner = actor.type === "employee" && payslip.employeeId === actor.employee.id;
  if (!isOwner && !actorHasPermission(actor, canManagePayroll)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({ payslip });
}
