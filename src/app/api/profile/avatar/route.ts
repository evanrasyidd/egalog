import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentEmployee } from "@/lib/current-employee";
import { updateAvatarColor, AVATAR_COLOR_PRESETS } from "@/lib/profile";

const bodySchema = z.object({
  color: z.enum(AVATAR_COLOR_PRESETS),
});

export async function PATCH(request: Request) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: "Warna tidak valid." },
      { status: 400 },
    );
  }

  const result = updateAvatarColor(employee.id, parsed.data.color);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
