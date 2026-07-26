import type { Metadata } from "next";
import { getActivityLog } from "@/lib/activity-log";
import { Card, PageHeader } from "@/components/card";

export const metadata: Metadata = { title: "Admin • Aktivitas" };

const TYPE_LABEL: Record<string, string> = {
  employee: "Karyawan",
  payroll: "Payroll",
  leave: "Cuti",
  rekrutmen: "Rekrutmen",
  pengaturan: "Pengaturan",
  holiday: "Hari Libur",
  announcement: "Pengumuman",
  system: "Sistem",
};

const TYPE_CLASS: Record<string, string> = {
  employee: "bg-primary/10 text-primary border-primary/25",
  payroll: "bg-success/10 text-success border-success/25",
  leave: "bg-warning/10 text-warning border-warning/25",
  rekrutmen: "bg-accent/10 text-accent border-accent/25",
  pengaturan: "bg-surface-muted text-foreground border-border",
  holiday: "bg-surface-muted text-foreground border-border",
  announcement: "bg-surface-muted text-foreground border-border",
  system: "bg-surface-muted text-foreground border-border",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export default async function AdminAktivitasPage() {
  const logs = getActivityLog();

  return (
    <div>
      <PageHeader
        title="Aktivitas Sistem"
        description="Riwayat perubahan & tindakan di sistem (admin-only)"
      />

      <Card>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Belum ada aktivitas tercatat.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-[8px] border border-border p-3 text-sm"
              >
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 mt-0.5 ${TYPE_CLASS[log.type]}`}
                >
                  {TYPE_LABEL[log.type] ?? log.type}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground">
                    <span className="font-medium">{log.actor}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">({log.actorRole})</span>
                    {" — "}
                    {log.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">{log.target}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{timeAgo(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
