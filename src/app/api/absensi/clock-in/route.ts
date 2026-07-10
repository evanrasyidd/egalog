import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentEmployee } from "@/lib/current-employee";
import { clockIn } from "@/lib/attendance";
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

  const result = clockIn(
    employee.id,
    { lat: parsed.data.lat, lng: parsed.data.lng },
    parsed.data.selfie,
  );

  if (!result.ok) {
    if (result.error === "already_clocked_in") {
      return NextResponse.json(
        { error: result.error, message: "Kamu sudah absen masuk hari ini." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      {
        error: result.error,
        message: `Lokasi kamu ${Math.round(result.distance ?? 0)}m dari ${OFFICE_LOCATION.label}, di luar radius ${OFFICE_LOCATION.radiusMeters}m yang diizinkan.`,
        distance: result.distance,
      },
      { status: 422 },
    );
  }

  return NextResponse.json({ ok: true, record: result.record, distance: result.distance });
}
