import type { Metadata } from "next";
import { getCurrentEmployee } from "@/lib/current-employee";
import { getHolidays } from "@/lib/holidays";
import { todayISO } from "@/lib/date";

export const metadata: Metadata = { title: "Kalender" };
import { Card, PageHeader } from "@/components/card";

export default async function KalenderPage() {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  const holidays = getHolidays();
  const today = todayISO();

  const groupedByMonth: Record<string, typeof holidays> = {};
  for (const h of holidays) {
    const month = h.date.slice(0, 7);
    if (!groupedByMonth[month]) groupedByMonth[month] = [];
    groupedByMonth[month].push(h);
  }

  const sortedMonths = Object.keys(groupedByMonth).sort();

  if (holidays.length === 0) {
    return (
      <div>
        <PageHeader title="Kalender & Hari Libur" />
        <p className="text-sm text-muted-foreground py-8 text-center">Belum ada data hari libur.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Kalender & Hari Libur" description={`${holidays.length} hari libur nasional & cuti bersama`} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedMonths.map((month) => {
          const monthHolidays = groupedByMonth[month];
          const [year, m] = month.split("-").map(Number);
          const monthName = new Date(year, m - 1, 1).toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          });
          const national = monthHolidays.filter((h) => h.isNational).length;
          const bersama = monthHolidays.filter((h) => !h.isNational).length;

          return (
            <Card key={month}>
              <h2 className="text-sm font-medium mb-3">{monthName}</h2>
              <p className="text-xs text-muted-foreground mb-3">
                {national} nasional · {bersama} cuti bersama
              </p>
              <div className="space-y-2">
                {monthHolidays.map((h) => (
                  <div
                    key={h.date}
                    className={`rounded-[8px] border px-3 py-2 text-sm ${h.date === today ? "border-accent bg-accent/5" : "border-border"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{h.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(h.date).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <span className={`text-xs ${h.isNational ? "text-success" : "text-warning"}`}>
                      {h.isNational ? "Libur Nasional" : "Cuti Bersama"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
