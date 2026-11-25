// Semua tanggal bisnis EgaLog memakai WIB (Asia/Jakarta), bukan zona server.
// Sebelumnya `toISOString()` dipakai langsung, sehingga antara 00:00–07:00 WIB
// tanggal yang terlihat masih "kemarin". Helper ini aman dipakai di client
// maupun server.

export const JAKARTA_TIME_ZONE = "Asia/Jakarta";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: JAKARTA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Tanggal hari ini di WIB, format YYYY-MM-DD. */
export function todayISO(): string {
  return DATE_FORMATTER.format(new Date());
}

/** Periode payroll bulan berjalan di WIB, format YYYY-MM. */
export function currentPeriod(): string {
  return todayISO().slice(0, 7);
}

/** Periode sebelumnya, format YYYY-MM. */
export function previousPeriod(period: string = currentPeriod()): string {
  const [year, month] = period.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 2, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Hari terakhir sebuah periode, format YYYY-MM-DD. */
export function periodEndDate(period: string): string {
  const [year, month] = period.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${period}-${String(lastDay).padStart(2, "0")}`;
}

/** Payroll hanya boleh difinalkan setelah periode benar-benar selesai. */
export function isPeriodClosed(period: string): boolean {
  return periodEndDate(period) < todayISO();
}

/** Daftar tanggal YYYY-MM-DD dari start sampai end (inklusif). */
export function eachDate(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00+07:00`);
  const end = new Date(`${endDate}T00:00:00+07:00`);
  while (cursor <= end) {
    dates.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`,
    );
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/**
 * Hitung hari kerja dalam rentang tanggal: Sabtu/Minggu dan hari libur
 * (yang dikirim sebagai daftar YYYY-MM-DD) tidak dihitung.
 */
export function countWorkingDaysInRange(
  startDate: string,
  endDate: string,
  holidayDates: Iterable<string> = [],
): number {
  if (!startDate || !endDate || endDate < startDate) return 0;
  const holidaySet = new Set(holidayDates);
  return eachDate(startDate, endDate).filter((date) => {
    const dayOfWeek = new Date(`${date}T00:00:00+07:00`).getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaySet.has(date);
  }).length;
}

/** Format tanggal panjang Indonesia, aman untuk string YYYY-MM-DD. */
export function formatDateID(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  const safeDate = dateStr.length === 10 ? `${dateStr}T00:00:00+07:00` : dateStr;
  return new Date(safeDate).toLocaleDateString("id-ID", {
    ...options,
    timeZone: JAKARTA_TIME_ZONE,
  });
}
