import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentActor } from "@/lib/current-actor";
import { createAnnouncement, getAllAnnouncements } from "@/lib/announcements";
import { createNotificationForAll } from "@/lib/notifications";

const createSchema = z.object({
  title: z.string().trim().min(2).max(200),
  content: z.string().trim().min(5).max(5000),
  priority: z.enum(["normal", "penting"]).default("normal"),
});

export async function GET() {
  const actor = await getCurrentActor();
  if (!actor || actor.type !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ announcements: getAllAnnouncements() });
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

  const ann = createAnnouncement(parsed.data.title, parsed.data.content, actor.admin.id, parsed.data.priority);
  createNotificationForAll("announcement", ann.title, ann.content.slice(0, 200), "/pengumuman");
  return NextResponse.json({ announcement: ann }, { status: 201 });
}
