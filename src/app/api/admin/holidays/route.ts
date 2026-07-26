import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentActor } from "@/lib/current-actor";
import { holidays } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string().trim().min(2).max(100),
  isNational: z.boolean().default(true),
});

export async function GET() {
  const actor = await getCurrentActor();
  if (!actor || actor.type !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ holidays });
}

export async function POST(request: Request) {
  const actor = await getCurrentActor();
  if (!actor || actor.type !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", message: "Data tidak valid." }, { status: 400 });
  }

  if (holidays.some((h) => h.date === parsed.data.date)) {
    return NextResponse.json({ error: "duplicate", message: "Tanggal ini sudah terdaftar sebagai hari libur." }, { status: 409 });
  }

  holidays.push(parsed.data);
  logActivity("holiday", actor.admin.name, "admin", `Menambahkan hari libur: ${parsed.data.name}`, parsed.data.date);
  return NextResponse.json({ holiday: parsed.data }, { status: 201 });
}
