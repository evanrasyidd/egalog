import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentEmployee } from "@/lib/current-employee";
import { getSystemSettings, updateSystemSettings } from "@/lib/settings";
import { ROLE_LEVEL } from "@/lib/types";

const updateSchema = z.object({
  workStartHour: z.number().int().min(0).max(23).optional(),
  workStartMinute: z.number().int().min(0).max(59).optional(),
  geofenceRadiusMeters: z.number().int().min(10).max(10000).optional(),
  officeLat: z.number().min(-90).max(90).optional(),
  officeLng: z.number().min(-180).max(180).optional(),
  officeLabel: z.string().trim().min(2).max(100).optional(),
  dailyTransportAllowance: z.number().int().min(0).optional(),
  dailyMealAllowance: z.number().int().min(0).optional(),
  latePenaltyPerDay: z.number().int().min(0).optional(),
  bpjsRate: z.number().min(0).max(1).optional(),
});

export async function GET() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const isManagement = ROLE_LEVEL[employee.role] <= ROLE_LEVEL.manager;
  if (!isManagement) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ settings: getSystemSettings() });
}

export async function PATCH(request: Request) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const isManagement = ROLE_LEVEL[employee.role] <= ROLE_LEVEL.manager;
  if (!isManagement) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", message: "Data tidak valid." }, { status: 400 });
  }
  const updated = updateSystemSettings(parsed.data);
  return NextResponse.json({ settings: updated });
}
