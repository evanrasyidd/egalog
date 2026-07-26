import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/current-employee";
import { deleteAnnouncement } from "@/lib/announcements";
import { ROLE_LEVEL } from "@/lib/types";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const isManagement = ROLE_LEVEL[employee.role] <= ROLE_LEVEL.manager;
  if (!isManagement) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const ok = deleteAnnouncement(id);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
