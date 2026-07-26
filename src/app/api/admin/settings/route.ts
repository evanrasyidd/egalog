import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentActor } from "@/lib/current-actor";
import { getSystemSettings, updateSystemSettings } from "@/lib/settings";

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
  const actor = await getCurrentActor();
  if (!actor || actor.type !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ settings: getSystemSettings() });
}

export async function PATCH(request: Request) {
  const actor = await getCurrentActor();
  if (!actor || actor.type !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", message: "Data tidak valid." }, { status: 400 });
  }
  const updated = updateSystemSettings(parsed.data);
  return NextResponse.json({ settings: updated });
}
