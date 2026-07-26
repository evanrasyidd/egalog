import "server-only";
import { systemSettings } from "./db";
import type { SystemSettings } from "./types";

export function getSystemSettings(): SystemSettings {
  return { ...systemSettings };
}

export function updateSystemSettings(partial: Partial<SystemSettings>): SystemSettings {
  Object.assign(systemSettings, partial);
  return getSystemSettings();
}
