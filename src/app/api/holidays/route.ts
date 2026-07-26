import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/current-employee";
import { getHolidays, getUpcomingHolidays } from "@/lib/holidays";

export async function GET(request: Request) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const upcoming = searchParams.get("upcoming");
  if (upcoming === "true") {
    return NextResponse.json({ holidays: getUpcomingHolidays() });
  }
  return NextResponse.json({ holidays: getHolidays() });
}
