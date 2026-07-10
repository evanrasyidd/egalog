import "server-only";
import { attendanceRecords, nextAttendanceId } from "./db";
import { isWithinOfficeRadius } from "./geofence";
import type { AttendanceRecord } from "./types";

const WORK_START_HOUR = 8;
const WORK_START_MINUTE = 15; // toleransi 15 menit dari jam 08:00
const TIMEZONE_OFFSET_HOURS = 7; // WIB (Asia/Jakarta)

function todayDateString(): string {
  const now = new Date(Date.now() + TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

export function getTodayRecord(employeeId: string): AttendanceRecord | undefined {
  const today = todayDateString();
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

  const now = new Date();
  const wibNow = new Date(now.getTime() + TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);
  const isLate =
    wibNow.getUTCHours() > WORK_START_HOUR ||
    (wibNow.getUTCHours() === WORK_START_HOUR &&
      wibNow.getUTCMinutes() > WORK_START_MINUTE);

  const record: AttendanceRecord = existing ?? {
    id: nextAttendanceId(),
    employeeId,
    date: todayDateString(),
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
