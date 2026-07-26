import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/current-employee";
import { markAllNotificationsAsRead } from "@/lib/notifications";

export async function POST() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  markAllNotificationsAsRead(employee.id);
  return NextResponse.json({ ok: true });
}
