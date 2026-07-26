import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/current-employee";
import { markNotificationAsRead } from "@/lib/notifications";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ok = markNotificationAsRead(id, employee.id);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
