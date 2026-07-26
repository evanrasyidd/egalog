import { NextResponse } from "next/server";
import { getCurrentActor } from "@/lib/current-actor";
import { holidays } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const actor = await getCurrentActor();
  if (!actor || actor.type !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { date } = await params;
  const idx = holidays.findIndex((h) => h.date === date);
  if (idx === -1) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const removed = holidays.splice(idx, 1)[0];
  logActivity("holiday", actor.admin.name, "admin", `Menghapus hari libur: ${removed.name}`, date);
  return NextResponse.json({ ok: true });
}
