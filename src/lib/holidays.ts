import "server-only";
import { holidays, isHoliday, getHolidayName, getWorkingDaysInPeriod } from "./db";
import type { Holiday } from "./types";

export function getHolidays(): Holiday[] {
  return [...holidays].sort((a, b) => a.date.localeCompare(b.date));
}

export function getHolidaysInRange(start: string, end: string): Holiday[] {
  return holidays.filter((h) => h.date >= start && h.date <= end);
}

export function getUpcomingHolidays(limit = 5): Holiday[] {
  const today = new Date().toISOString().slice(0, 10);
  return holidays
    .filter((h) => h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export { isHoliday, getHolidayName, getWorkingDaysInPeriod };

export function getMonthlyHolidays(year: number, month: number): Holiday[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return holidays.filter((h) => h.date.startsWith(prefix));
}
