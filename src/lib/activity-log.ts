import "server-only";
import { activityLogEntries, nextActivityLogId } from "./db";
import type { ActivityLogEntry } from "./db";

export type { ActivityLogEntry } from "./db";

export function logActivity(
  type: ActivityLogEntry["type"],
  actor: string,
  actorRole: string,
  action: string,
  target: string,
): ActivityLogEntry {
  const entry: ActivityLogEntry = {
    id: nextActivityLogId(),
    type,
    actor,
    actorRole,
    action,
    target,
    createdAt: new Date().toISOString(),
  };
  activityLogEntries.push(entry);
  return entry;
}

export function getActivityLog(limit = 50): ActivityLogEntry[] {
  return [...activityLogEntries]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function getRecentActivityLog(limit = 10): ActivityLogEntry[] {
  return getActivityLog(limit);
}
