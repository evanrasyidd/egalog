import "server-only";
import { announcements, nextAnnouncementId } from "./db";
import type { Announcement } from "./types";

export function createAnnouncement(
  title: string,
  content: string,
  createdBy: string,
  priority: "normal" | "penting" = "normal",
): Announcement {
  const ann: Announcement = {
    id: nextAnnouncementId(),
    title,
    content,
    createdBy,
    createdAt: new Date().toISOString(),
    priority,
  };
  announcements.push(ann);
  return ann;
}

export function getAllAnnouncements(): Announcement[] {
  return [...announcements].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAnnouncementById(id: string): Announcement | undefined {
  return announcements.find((a) => a.id === id);
}

export function deleteAnnouncement(id: string): boolean {
  const idx = announcements.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  announcements.splice(idx, 1);
  return true;
}
