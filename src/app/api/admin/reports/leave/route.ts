import { NextResponse } from "next/server";
import { getCurrentActor } from "@/lib/current-actor";
import { leaveRequests, employees } from "@/lib/db";
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

  let filtered = scopeIds ? leaveRequests.filter((r) => scopeIds.has(r.employeeId)) : leaveRequests;
  if (dateFrom && dateTo) {
    filtered = filtered.filter((r) => {
      const d = r.createdAt.slice(0, 10);
      return d >= dateFrom && d <= dateTo;
    });
  }

  const data = filtered.map((r) => {
    const emp = employees.find((e) => e.id === r.employeeId);
    return {
      nip: emp?.nip ?? r.employeeId, name: emp?.name ?? r.employeeId,
      type: r.type, startDate: r.startDate, endDate: r.endDate,
      reason: r.reason, status: r.status, createdAt: r.createdAt,
    };
  });

  const menunggu = data.filter((r) => r.status === "menunggu").length;
  const disetujui = data.filter((r) => r.status === "disetujui").length;
  const ditolak = data.filter((r) => r.status === "ditolak").length;

  return NextResponse.json({ total: filtered.length, menunggu, disetujui, ditolak, data });
}
