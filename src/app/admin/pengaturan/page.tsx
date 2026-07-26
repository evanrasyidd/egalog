import type { Metadata } from "next";
import { getSystemSettings } from "@/lib/settings";
import { getActivityLog } from "@/lib/activity-log";
import { Card, PageHeader } from "@/components/card";

export const metadata: Metadata = { title: "Admin • Pengaturan" };
import { AdminSettingsForm } from "./admin-settings-form";

export default async function AdminPengaturanPage() {
  const settings = getSystemSettings();
  const logs = getActivityLog(50);

  return (
    <div>
      <PageHeader title="Pengaturan Sistem" description="Konfigurasi jam kerja, geofence, & komponen payroll" />
      <Card>
        <AdminSettingsForm initialSettings={settings} />
      </Card>

      <Card className="mt-5">
        <h2 className="text-sm font-medium mb-4">Log Aktivitas (50 terakhir)</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Belum ada aktivitas tercatat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" aria-label="Log aktivitas sistem">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium pr-3">Waktu</th>
                  <th className="pb-2 font-medium pr-3">Aktor</th>
                  <th className="pb-2 font-medium pr-3">Role</th>
                  <th className="pb-2 font-medium pr-3">Aksi</th>
                  <th className="pb-2 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-muted">
                    <td className="py-2 pr-3 whitespace-nowrap font-mono text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap font-medium">{log.actor}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">{log.actorRole}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{log.action}</td>
                    <td className="py-2 whitespace-nowrap text-muted-foreground font-mono max-w-[200px] truncate">{log.target}</td>
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
