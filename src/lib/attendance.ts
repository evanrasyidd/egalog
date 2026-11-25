import "server-only";
import { attendanceRecords, nextAttendanceId } from "./db";
import { todayISO } from "./date";
import { isWithinOfficeRadius } from "./geofence";
import { getSystemSettings } from "./settings";
import type { AttendanceRecord } from "./types";

const TIMEZONE_OFFSET_HOURS = 7; // WIB (Asia/Jakarta)

export function getTodayRecord(employeeId: string): AttendanceRecord | undefined {
  const today = todayISO();
  return attendanceRecords.find(
    (r) => r.employeeId === employeeId && r.date === today,
  );
}

export type ClockInResult =
  | { ok: true; record: AttendanceRecord; distance: number }
  | { ok: false; error: "already_clocked_in" | "outside_radius"; distance?: number };

export function clockIn(
  employeeId: string,
  location: { lat: number; lng: number },
  selfie: string,
): ClockInResult {
  const existing = getTodayRecord(employeeId);
  if (existing?.clockIn) {
    return { ok: false, error: "already_clocked_in" };
  }

  const { withinRadius, distance } = isWithinOfficeRadius(location);
  if (!withinRadius) {
    return { ok: false, error: "outside_radius", distance };
  }

  const settings = getSystemSettings();
  const now = new Date();
  const wibNow = new Date(now.getTime() + TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);
  const isLate =
    wibNow.getUTCHours() > settings.workStartHour ||
    (wibNow.getUTCHours() === settings.workStartHour &&
      wibNow.getUTCMinutes() > settings.workStartMinute);

  const record: AttendanceRecord = existing ?? {
    id: nextAttendanceId(),
    employeeId,
    date: todayISO(),
    clockIn: null,
    clockOut: null,
    clockInLocation: null,
    clockOutLocation: null,
    selfieClockIn: null,
    selfieClockOut: null,
    status: "hadir",
  };

  record.clockIn = now.toISOString();
  record.clockInLocation = location;
  record.selfieClockIn = selfie;
  record.status = isLate ? "terlambat" : "hadir";

  if (!existing) attendanceRecords.push(record);

  return { ok: true, record, distance };
}

export type ClockOutResult =
  | { ok: true; record: AttendanceRecord; distance: number }
  | { ok: false; error: "not_clocked_in" | "already_clocked_out" | "outside_radius"; distance?: number };

export function clockOut(
  employeeId: string,
  location: { lat: number; lng: number },
  selfie: string,
): ClockOutResult {
  const existing = getTodayRecord(employeeId);
  if (!existing?.clockIn) {
    return { ok: false, error: "not_clocked_in" };
  }
  if (existing.clockOut) {
    return { ok: false, error: "already_clocked_out" };
  }

  const { withinRadius, distance } = isWithinOfficeRadius(location);
  if (!withinRadius) {
    return { ok: false, error: "outside_radius", distance };
  }

  existing.clockOut = new Date().toISOString();
  existing.clockOutLocation = location;
  existing.selfieClockOut = selfie;

  return { ok: true, record: existing, distance };
}

export function getRecordsForEmployees(employeeIds: string[]): AttendanceRecord[] {
  return attendanceRecords
    .filter((r) => employeeIds.includes(r.employeeId))
    .sort((a, b) => b.date.localeCompare(a.date));
}
