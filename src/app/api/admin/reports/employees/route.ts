import { NextResponse } from "next/server";
import { getCurrentActor } from "@/lib/current-actor";
import { employees } from "@/lib/db";
import { DEPARTMENT_LABEL, ROLE_LABEL, ROLE_LEVEL } from "@/lib/types";
import { getReportScope } from "@/lib/reports";

export async function GET() {
  const actor = await getCurrentActor();
  if (!actor) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (actor.type !== "admin" && ROLE_LEVEL[actor.employee.role] > ROLE_LEVEL.manager) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const scopeIds = getReportScope(actor);
  const filtered = scopeIds ? employees.filter((e) => scopeIds.has(e.id)) : employees;
  const data = filtered.map((e) => ({
    nip: e.nip, name: e.name, email: e.email,
    role: ROLE_LABEL[e.role], department: DEPARTMENT_LABEL[e.department],
    jobTitle: e.jobTitle, status: e.isActive ? "Aktif" : "Nonaktif", joinedAt: e.joinedAt,
  }));
  return NextResponse.json({
    total: filtered.length, active: filtered.filter((e) => e.isActive).length,
    inactive: filtered.filter((e) => !e.isActive).length, data,
  });
}
