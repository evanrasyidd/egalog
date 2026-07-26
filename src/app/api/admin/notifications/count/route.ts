import { NextResponse } from "next/server";
import { getCurrentActor } from "@/lib/current-actor";
import { getUnreadAdminNotificationCount } from "@/lib/notifications";

export async function GET() {
  const actor = await getCurrentActor();
  if (!actor || actor.type !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const count = getUnreadAdminNotificationCount();
  return NextResponse.json({ count });
}
