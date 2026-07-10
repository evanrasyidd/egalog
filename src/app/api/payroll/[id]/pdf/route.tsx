import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentActor, actorHasPermission } from "@/lib/current-actor";
import { canManagePayroll } from "@/lib/permissions";
import { findPayslipById } from "@/lib/payroll";
import { findEmployeeById } from "@/lib/db";
import { PayslipDocument } from "@/lib/payslip-pdf";

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

  const payslipOwner = findEmployeeById(payslip.employeeId);
  if (!payslipOwner) {
    return NextResponse.json({ error: "employee_not_found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    <PayslipDocument payslip={payslip} employee={payslipOwner} />,
  );

  const filename = `slip-gaji-${payslipOwner.nip}-${payslip.period}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
