import {
  Users,
  Banknote,
  Briefcase,
  TrendingUp,
  FileText,
  ShieldCheck,
  CalendarDays,
  Megaphone,
  Bell,
  Network,
  Settings,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: typeof Users;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin/karyawan", label: "Kelola Karyawan", icon: Users },
  { href: "/admin/payroll", label: "Kelola Payroll", icon: Banknote },
  { href: "/admin/rekrutmen", label: "Kelola Rekrutmen", icon: Briefcase },
  { href: "/admin/analytics", label: "HR Analytics", icon: TrendingUp },
  { href: "/admin/laporan", label: "Laporan & Ekspor", icon: FileText },
  { href: "/admin/aktivitas", label: "Aktivitas Sistem", icon: ShieldCheck },
  { href: "/admin/hari-libur", label: "Hari Libur", icon: CalendarDays },
  { href: "/admin/pengumuman", label: "Pengumuman", icon: Megaphone },
  { href: "/admin/notifikasi", label: "Notifikasi", icon: Bell },
  { href: "/admin/organisasi", label: "Organisasi", icon: Network },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export const ADMIN_BAR_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin/karyawan", label: "Karyawan", icon: Users },
  { href: "/admin/payroll", label: "Payroll", icon: Banknote },
  { href: "/admin/laporan", label: "Laporan", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
];