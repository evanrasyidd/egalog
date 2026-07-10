import { NextResponse } from "next/server";
import { getCurrentActor, actorHasPermission } from "@/lib/current-actor";
import { canManageEmployees } from "@/lib/permissions";
import { resetEmployeePassword } from "@/lib/employees";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!actorHasPermission(actor, canManageEmployees)) {
    return NextResponse.json(
      { error: "forbidden", message: "Kamu tidak punya akses untuk reset password karyawan." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const result = resetEmployeePassword(id);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, message: "Karyawan tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, tempPassword: result.tempPassword });
}
