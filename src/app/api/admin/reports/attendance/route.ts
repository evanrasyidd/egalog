import { NextResponse } from "next/server";
import { getCurrentActor } from "@/lib/current-actor";
import { attendanceRecords, employees } from "@/lib/db";
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

  let filtered = scopeIds ? attendanceRecords.filter((r) => scopeIds.has(r.employeeId)) : attendanceRecords;
  if (dateFrom && dateTo) {
    filtered = filtered.filter((r) => r.date >= dateFrom && r.date <= dateTo);
  } else if (dateFrom) {
    filtered = filtered.filter((r) => r.date >= dateFrom);
  } else if (dateTo) {
    filtered = filtered.filter((r) => r.date <= dateTo);
  }

  const data = filtered.map((r) => {
    const emp = employees.find((e) => e.id === r.employeeId);
    return {
      nip: emp?.nip ?? r.employeeId, name: emp?.name ?? r.employeeId,
      date: r.date, clockIn: r.clockIn ?? "-", clockOut: r.clockOut ?? "-",
      status: r.status, note: r.note ?? "",
    };
  });

  const hadir = data.filter((r) => r.status === "hadir").length;
  const terlambat = data.filter((r) => r.status === "terlambat").length;
  const alpha = data.filter((r) => r.status === "alpha").length;

  return NextResponse.json({ total: filtered.length, hadir, terlambat, alpha, data });
}
