"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav";
import { BrandLogo } from "./brand";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar-bg text-sidebar-foreground">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10">
        <BrandLogo tone="reversed" className="h-[22px] w-auto" />
        <span className="rounded-[3px] border border-white/20 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-sidebar-foreground/75">
          HR
        </span>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-sidebar-foreground/65">
          SYS
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white font-medium"
                  : "text-sidebar-foreground/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${isActive ? "text-sidebar-active" : ""}`}
                strokeWidth={1.75}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-white/10 text-xs text-sidebar-foreground/65">
        PT EgaLog Indonesia — Akun Sistem
      </div>
    </aside>
  );
}