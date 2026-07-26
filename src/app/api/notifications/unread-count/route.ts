import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/current-employee";
import { getUnreadNotificationCount } from "@/lib/notifications";

export async function GET() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const count = getUnreadNotificationCount(employee.id);
  return NextResponse.json({ count });
}
