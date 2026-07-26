import { NextResponse } from "next/server";
import { getCurrentActor } from "@/lib/current-actor";
import { markAdminNotificationAsRead } from "@/lib/notifications";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentActor();
  if (!actor || actor.type !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ok = markAdminNotificationAsRead(id);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
