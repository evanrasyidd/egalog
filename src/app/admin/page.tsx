import type { Metadata } from "next";
import Link from "next/link";
import {
  Users, Banknote, Briefcase, TrendingUp, FileText, ShieldCheck, CalendarDays,
  Megaphone, Settings, Bell, Network, Activity,
} from "lucide-react";

export const metadata: Metadata = { title: "Admin • Dashboard" };
import { employees, leaveRequests, attendanceRecords, payslips } from "@/lib/db";
import { getRecentActivityLog } from "@/lib/activity-log";
import { Card } from "@/components/card";
import { formatCurrency } from "@/lib/format";

const QUICK_LINKS = [
  { href: "/admin/karyawan", label: "Kelola Karyawan", icon: Users, desc: "Tambah, edit, nonaktifkan" },
  { href: "/admin/payroll", label: "Kelola Payroll", icon: Banknote, desc: "Generate slip gaji" },
  { href: "/admin/rekrutmen", label: "Rekrutmen", icon: Briefcase, desc: "Lowongan & kandidat" },
  { href: "/admin/analytics", label: "HR Analytics", icon: TrendingUp, desc: "Data & statistik" },
  { href: "/admin/laporan", label: "Laporan", icon: FileText, desc: "Preview & ekspor CSV" },
  { href: "/admin/aktivitas", label: "Aktivitas", icon: Activity, desc: "Riwayat perubahan" },
  { href: "/admin/hari-libur", label: "Hari Libur", icon: CalendarDays, desc: "Atur hari libur" },
  { href: "/admin/pengumuman", label: "Pengumuman", icon: Megaphone, desc: "Kirim broadcast" },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings, desc: "Konfigurasi sistem" },
  { href: "/admin/notifikasi", label: "Notifikasi", icon: Bell, desc: "Notifikasi sistem" },
  { href: "/admin/organisasi", label: "Organisasi", icon: Network, desc: "Struktur perusahaan" },
];

export default function AdminDashboardPage() {
  const activeEmployees = employees.filter((e) => e.isActive).length;
  const totalDepartments = new Set(employees.filter((e) => e.isActive).map((e) => e.department)).size;
  const pendingLeaves = leaveRequests.filter((r) => r.status === "menunggu").length;
  const totalPayslips = payslips.length;
  const presentToday = attendanceRecords.filter(
    (r) => r.date === new Date().toISOString().slice(0, 10) && r.clockIn,
  ).length;
  const recentLogs = getRecentActivityLog(5);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Dashboard Admin</h1>
      <p className="text-sm text-muted-foreground mb-6">Ringkasan sistem PT EgaLog Indonesia</p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <p className="text-xs text-muted-foreground mb-1">Karyawan Aktif</p>
          <p className="text-2xl font-semibold font-mono">{activeEmployees}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground mb-1">Departemen</p>
          <p className="text-2xl font-semibold font-mono">{totalDepartments}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground mb-1">Hadir Hari Ini</p>
          <p className="text-2xl font-semibold font-mono">{presentToday}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground mb-1">Cuti Menunggu</p>
          <p className="text-2xl font-semibold font-mono text-warning">{pendingLeaves}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground mb-1">Payroll Terbit</p>
          <p className="text-2xl font-semibold font-mono">{totalPayslips}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {recentLogs.length > 0 && (
          <Card className="lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Aktivitas Terbaru</h2>
              <Link href="/admin/aktivitas" className="text-xs text-primary hover:underline">Lihat semua</Link>
            </div>
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div key={log.id} className="text-xs text-muted-foreground border-l-2 border-border pl-3">
                  <p className="text-foreground truncate">{log.actor} — {log.action}</p>
                  <p className="mt-0.5">{new Date(log.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className={recentLogs.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
          <h2 className="text-sm font-medium mb-4">Menu Cepat</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-start gap-2.5 rounded-[8px] border border-border p-3 hover:border-primary/40 hover:bg-surface-muted transition-colors"
                >
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" strokeWidth={1.75} />
                  <div>
                    <p className="text-sm font-medium leading-tight">{link.label}</p>
                    <p className="text-xs text-muted-foreground leading-tight mt-0.5">{link.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
