import { getCurrentEmployee } from "@/lib/current-employee";
import { getTodayRecord, getRecordsForEmployees } from "@/lib/attendance";
import { OFFICE_LOCATION } from "@/lib/db";
import { AttendanceWidget } from "@/components/attendance-widget";
import { StatusBadge } from "@/components/status-badge";
import { SelfieThumbnail } from "@/components/selfie-thumbnail";
import { Card, PageHeader } from "@/components/card";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

export default async function AbsensiPage() {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  const todayRecord = getTodayRecord(employee.id) ?? null;
  const history = getRecordsForEmployees([employee.id]).slice(0, 14);

  return (
    <div>
      <PageHeader
        title="Absensi"
        description="Absen masuk & pulang wajib dilakukan di dalam radius kantor."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 h-fit">
          <h2 className="text-sm font-medium mb-4">Hari Ini</h2>
          <AttendanceWidget initialRecord={todayRecord} officeLabel={OFFICE_LOCATION.label} />
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-sm font-medium mb-4">Riwayat 14 Hari Terakhir</h2>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Belum ada riwayat absensi.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="pb-2 font-medium">Tanggal</th>
                    <th className="pb-2 font-medium">Masuk</th>
                    <th className="pb-2 font-medium">Pulang</th>
                    <th className="pb-2 font-medium">Foto</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2.5">{formatDate(r.date)}</td>
                      <td className="py-2.5 font-mono">{formatTime(r.clockIn)}</td>
                      <td className="py-2.5 font-mono">{formatTime(r.clockOut)}</td>
                      <td className="py-2.5">
                        <div className="flex gap-1.5">
                          {r.selfieClockIn && (
                            <SelfieThumbnail src={r.selfieClockIn} alt="Selfie masuk" />
                          )}
                          {r.selfieClockOut && (
                            <SelfieThumbnail src={r.selfieClockOut} alt="Selfie pulang" />
                          )}
                        </div>
                      </td>
                      <td className="py-2.5">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
