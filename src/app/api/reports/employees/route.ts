import { NextResponse } from "next/server";
import { getCurrentActor } from "@/lib/current-actor";
import { exportEmployeesCsv, getReportScope } from "@/lib/reports";
import { ROLE_LEVEL } from "@/lib/types";

export async function GET() {
  const actor = await getCurrentActor();
  if (!actor) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (actor.type !== "admin" && ROLE_LEVEL[actor.employee.role] > ROLE_LEVEL.manager) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const scopeIds = getReportScope(actor);
  const csv = exportEmployeesCsv(scopeIds);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="karyawan.csv"',
    },
  });
}
