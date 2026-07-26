import { NextResponse } from "next/server";
import { getCurrentActor } from "@/lib/current-actor";
import { payslips, employees } from "@/lib/db";
import { ROLE_LEVEL } from "@/lib/types";
import { getReportScope } from "@/lib/reports";

export async function GET(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (actor.type !== "admin" && ROLE_LEVEL[actor.employee.role] > ROLE_LEVEL.manager) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const scopeIds = getReportScope(actor);
  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  let filtered = scopeIds ? payslips.filter((p) => scopeIds.has(p.employeeId)) : payslips;
  if (dateFrom && dateTo) {
    filtered = filtered.filter((p) => p.period >= dateFrom.slice(0, 7) && p.period <= dateTo.slice(0, 7));
  }

  const data = filtered.map((p) => {
    const emp = employees.find((e) => e.id === p.employeeId);
    return {
      nip: emp?.nip ?? p.employeeId, name: emp?.name ?? p.employeeId,
      baseSalary: p.earnings.baseSalary, transport: p.earnings.allowanceTransport,
      meal: p.earnings.allowanceMeal, position: p.earnings.allowancePosition,
      overtime: p.earnings.overtimePay, bpjs: p.deductions.bpjs,
      tax: p.deductions.incomeTax, latePenalty: p.deductions.latePenalty,
      alphaPenalty: p.deductions.absencePenalty, netPay: p.netPay, period: p.period,
    };
  });

  const totalNetPay = data.reduce((s, p) => s + p.netPay, 0);
  return NextResponse.json({ total: filtered.length, totalNetPay, data });
}
