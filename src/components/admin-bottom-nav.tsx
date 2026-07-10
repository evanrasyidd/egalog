"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Banknote, Briefcase } from "lucide-react";

const ADMIN_NAV_ITEMS = [
  { href: "/admin/karyawan", label: "Karyawan", icon: Users },
  { href: "/admin/payroll", label: "Payroll", icon: Banknote },
  { href: "/admin/rekrutmen", label: "Rekrutmen", icon: Briefcase },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi admin"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 flex bg-sidebar-bg border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] transition-colors ${
              isActive ? "text-sidebar-active" : "text-sidebar-foreground/65"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
