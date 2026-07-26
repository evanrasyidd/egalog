import { NextResponse } from "next/server";
import { getCurrentActor } from "@/lib/current-actor";
import { exportLeaveCsv, getReportScope } from "@/lib/reports";
import { ROLE_LEVEL } from "@/lib/types";

export async function GET(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (actor.type !== "admin" && ROLE_LEVEL[actor.employee.role] > ROLE_LEVEL.manager) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const scopeIds = getReportScope(actor);
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const csv = exportLeaveCsv(scopeIds, period ?? undefined, dateFrom ?? undefined, dateTo ?? undefined);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cuti.csv"`,
    },
  });
}
