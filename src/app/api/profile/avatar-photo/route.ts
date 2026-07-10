import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentEmployee } from "@/lib/current-employee";
import { updateAvatarPhoto } from "@/lib/profile";
import { avatarPhotoSchema } from "@/lib/avatar-photo-schema";

const bodySchema = z.object({
  photo: avatarPhotoSchema.nullable(),
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
      {
        error: "invalid_input",
        message: parsed.error.issues[0]?.message ?? "Foto tidak valid.",
      },
      { status: 400 },
    );
  }

  const result = updateAvatarPhoto(employee.id, parsed.data.photo);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
