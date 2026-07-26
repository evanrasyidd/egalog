import { NextResponse } from "next/server";
import { getCurrentActor } from "@/lib/current-actor";
import { markAllAdminNotificationsAsRead } from "@/lib/notifications";

export async function POST() {
  const actor = await getCurrentActor();
  if (!actor || actor.type !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  markAllAdminNotificationsAsRead();
  return NextResponse.json({ ok: true });
}
