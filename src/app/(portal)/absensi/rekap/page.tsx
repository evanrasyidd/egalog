import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/current-employee";
import { getSubordinateIds, findEmployeeById } from "@/lib/db";
import { getTodayRecord } from "@/lib/attendance";
import { ROLE_LEVEL, ROLE_LABEL } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { SelfieThumbnail } from "@/components/selfie-thumbnail";
import { Card, PageHeader } from "@/components/card";

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

export default async function RekapAbsensiPage() {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  const isApproverLevel = ROLE_LEVEL[employee.role] <= ROLE_LEVEL.supervisor;
  if (!isApproverLevel) redirect("/dashboard");

  const subordinateIds = Array.from(getSubordinateIds(employee.id));
  const rows = subordinateIds
    .map((id) => {
      const person = findEmployeeById(id);
      const record = getTodayRecord(id);
      return person ? { person, record } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => a.person.name.localeCompare(b.person.name));

  return (
    <div>
      <PageHeader
        title="Rekap Absensi Tim"
        description={`Status kehadiran hari ini untuk ${rows.length} anggota tim di bawah garis komandomu.`}
      />

      <Card>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Belum ada anggota tim di bawah garis komandomu.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium">Nama</th>
                  <th className="pb-2 font-medium">Jabatan</th>
                  <th className="pb-2 font-medium">Masuk</th>
                  <th className="pb-2 font-medium">Pulang</th>
                  <th className="pb-2 font-medium">Foto</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map(({ person, record }) => (
                  <tr key={person.id}>
                    <td className="py-2.5">
                      <p className="font-medium">{person.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ROLE_LABEL[person.role]}
                      </p>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{person.jobTitle}</td>
                    <td className="py-2.5 font-mono">{formatTime(record?.clockIn ?? null)}</td>
                    <td className="py-2.5 font-mono">{formatTime(record?.clockOut ?? null)}</td>
                    <td className="py-2.5">
                      <div className="flex gap-1.5">
                        {record?.selfieClockIn && (
                          <SelfieThumbnail src={record.selfieClockIn} alt={`Selfie masuk ${person.name}`} />
                        )}
                        {record?.selfieClockOut && (
                          <SelfieThumbnail src={record.selfieClockOut} alt={`Selfie pulang ${person.name}`} />
                        )}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={record?.status ?? "alpha"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
