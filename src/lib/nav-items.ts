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
  Bell,
  Search,
  Megaphone,
  Settings,
  ChevronRight,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  matchPrefix?: boolean;
}

export interface NavGroup {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  children: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

export interface NavAccess {
  isApproverLevel: boolean;
  isManagementLevel: boolean;
  isOwnerLevel: boolean;
  isPayrollManager: boolean;
  isAdmin: boolean;
  role: string;
  department: string;
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: LayoutGrid },
  { href: "/absensi", label: "Absensi", icon: Fingerprint },
  { href: "/cuti", label: "Cuti", icon: CalendarDays },
  { href: "/payroll", label: "Payroll", icon: Wallet },
];

export function getNavEntries(access: NavAccess): NavEntry[] {
  const { isApproverLevel, isManagementLevel, isOwnerLevel, isPayrollManager } = access;

  const absensiChildren: NavItem[] = [];
  const cutiChildren: NavItem[] = [];
  const performanceChildren: NavItem[] = [];
  const payrollChildren: NavItem[] = [];

  if (isApproverLevel) {
    absensiChildren.push({ href: "/absensi/rekap", label: "Rekap Absensi", icon: ClipboardCheck, matchPrefix: true });
    cutiChildren.push({ href: "/cuti/approval", label: "Approval Cuti", icon: ClipboardCheck, matchPrefix: true });
    performanceChildren.push({ href: "/performance/kelola", label: "Kelola Review", icon: ClipboardCheck, matchPrefix: true });
  }

  if (isPayrollManager) {
    payrollChildren.push({ href: "/payroll/kelola", label: "Kelola Payroll", icon: Banknote, matchPrefix: true });
  }

  const entries: NavEntry[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  ];

  if (absensiChildren.length > 0) {
    entries.push({ href: "/absensi", label: "Absensi", icon: Fingerprint, children: absensiChildren });
  } else {
    entries.push({ href: "/absensi", label: "Absensi", icon: Fingerprint });
  }

  if (cutiChildren.length > 0) {
    entries.push({ href: "/cuti", label: "Cuti & Izin", icon: CalendarDays, children: cutiChildren });
  } else {
    entries.push({ href: "/cuti", label: "Cuti & Izin", icon: CalendarDays });
  }

  if (payrollChildren.length > 0) {
    entries.push({ href: "/payroll", label: "Payroll", icon: Wallet, children: payrollChildren });
  } else {
    entries.push({ href: "/payroll", label: "Payroll", icon: Wallet });
  }

  if (performanceChildren.length > 0) {
    entries.push({ href: "/performance", label: "Performance Review", icon: TrendingUp, children: performanceChildren });
  } else {
    entries.push({ href: "/performance", label: "Performance Review", icon: TrendingUp });
  }

  entries.push({ href: "/rekrutmen", label: "Rekrutmen", icon: Briefcase, matchPrefix: true });

  if (isApproverLevel) {
    entries.push({ href: "/approval", label: "Approval", icon: ClipboardCheck });
  }

  entries.push(
    { href: "/kalender", label: "Kalender", icon: CalendarDays },
    { href: "/pengumuman", label: "Pengumuman", icon: Megaphone },
  );

  if (isManagementLevel) {
    entries.push(
      { href: "/karyawan", label: "Karyawan", icon: Users },
      { href: "/analytics", label: "HR Analytics", icon: TrendingUp },
    );
  }

  if (isOwnerLevel) {
    entries.push({ href: "/pengaturan", label: "Pengaturan", icon: Settings });
  }

  entries.push({ href: "/organisasi", label: "Struktur Organisasi", icon: Network });

  return entries;
}

export function getNavItems(access: NavAccess): NavItem[] {
  const items: NavItem[] = [];
  for (const entry of getNavEntries(access)) {
    if ("children" in entry) {
      items.push({ href: entry.href, label: entry.label, icon: entry.icon });
      items.push(...entry.children);
    } else {
      items.push(entry);
    }
  }
  return items;
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  return item.matchPrefix
    ? pathname === item.href || pathname.startsWith(`${item.href}/`)
    : pathname === item.href;
}

export function isNavEntryActive(pathname: string, entry: NavEntry): boolean {
  if ("children" in entry) {
    return entry.children.some((child) => isNavItemActive(pathname, child));
  }
  return isNavItemActive(pathname, entry);
}

export function getNavEntryChildren(entry: NavEntry): NavItem[] {
  return "children" in entry ? entry.children : [];
}
