import {
  LayoutGrid,
  Fingerprint,
  CalendarDays,
  ClipboardCheck,
  Users,
  Network,
  Wallet,
  Banknote,
  TrendingUp,
  Briefcase,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  matchPrefix?: boolean;
}

export interface NavAccess {
  isApproverLevel: boolean;
  isManagementLevel: boolean;
  isPayrollManager: boolean;
}

/**
 * 4 item paling sering dipakai dari HP — dipakai di bottom nav bar (mobile).
 * Sengaja fixed & sama untuk semua role (bukan role-aware) karena bottom bar
 * mobile harus konsisten & terbatas (maks 4-5 item, standar UX app mobile).
 * Menu lengkap (termasuk yang role-spesifik) tetap ada lewat tombol "Menu".
 */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: LayoutGrid },
  { href: "/absensi", label: "Absensi", icon: Fingerprint, matchPrefix: true },
  { href: "/cuti", label: "Cuti", icon: CalendarDays, matchPrefix: true },
  { href: "/payroll", label: "Payroll", icon: Wallet },
];

export function getNavItems({
  isApproverLevel,
  isManagementLevel,
  isPayrollManager,
}: NavAccess): NavItem[] {
  const items: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/absensi", label: "Absensi", icon: Fingerprint, matchPrefix: true },
    { href: "/cuti", label: "Cuti & Izin", icon: CalendarDays, matchPrefix: true },
    { href: "/payroll", label: "Payroll", icon: Wallet },
    { href: "/performance", label: "Performance Review", icon: TrendingUp },
    { href: "/rekrutmen", label: "Rekrutmen", icon: Briefcase, matchPrefix: true },
  ];

  if (isApproverLevel) {
    items.push(
      { href: "/absensi/rekap", label: "Rekap Absensi", icon: ClipboardCheck },
      { href: "/cuti/approval", label: "Approval Cuti", icon: ClipboardCheck },
      { href: "/performance/kelola", label: "Kelola Review", icon: ClipboardCheck, matchPrefix: true },
    );
  }

  if (isPayrollManager) {
    items.push({ href: "/payroll/kelola", label: "Kelola Payroll", icon: Banknote });
  }

  if (isManagementLevel) {
    items.push({ href: "/karyawan", label: "Karyawan", icon: Users });
  }

  items.push({ href: "/organisasi", label: "Struktur Organisasi", icon: Network });

  return items;
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  return item.matchPrefix
    ? pathname === item.href || pathname.startsWith(`${item.href}/`)
    : pathname === item.href;
}
