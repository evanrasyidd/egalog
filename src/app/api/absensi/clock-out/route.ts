import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentEmployee } from "@/lib/current-employee";
import { clockOut } from "@/lib/attendance";
import { OFFICE_LOCATION } from "@/lib/db";
import { selfieSchema } from "@/lib/selfie-schema";

const bodySchema = z.object({
  lat: z.number(),
  lng: z.number(),
  selfie: selfieSchema,
});

export async function POST(request: Request) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_input",
        message: parsed.error.issues[0]?.message ?? "Data absensi tidak valid.",
      },
      { status: 400 },
    );
  }

  const result = clockOut(
    employee.id,
    { lat: parsed.data.lat, lng: parsed.data.lng },
    parsed.data.selfie,
  );

  if (!result.ok) {
    const messages: Record<string, string> = {
      not_clocked_in: "Kamu belum absen masuk hari ini.",
      already_clocked_out: "Kamu sudah absen pulang hari ini.",
      outside_radius: `Lokasi kamu ${Math.round(result.distance ?? 0)}m dari ${OFFICE_LOCATION.label}, di luar radius ${OFFICE_LOCATION.radiusMeters}m yang diizinkan.`,
    };
    const status = result.error === "outside_radius" ? 422 : 409;
    return NextResponse.json(
      { error: result.error, message: messages[result.error], distance: result.distance },
      { status },
    );
  }

  return NextResponse.json({ ok: true, record: result.record, distance: result.distance });
}
