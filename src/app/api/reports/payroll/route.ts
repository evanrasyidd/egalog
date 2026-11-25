import { NextResponse } from "next/server";
import { getCurrentActor, actorHasPermission } from "@/lib/current-actor";
import { canManagePayroll } from "@/lib/permissions";
import { exportPayrollCsv } from "@/lib/reports";

export async function GET(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // Gaji bukan data tim: hanya Owner/Direktur/Manager Finance (dan Admin).
  // Manager operasional tidak boleh mengunduh gaji bawahannya lewat CSV.
  if (!actorHasPermission(actor, canManagePayroll)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const csv = exportPayrollCsv(null, period ?? undefined, dateFrom ?? undefined, dateTo ?? undefined);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="payroll.csv"`,
    },
  });
}
