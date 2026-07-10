"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, User } from "lucide-react";
import { getNavItems, isNavItemActive, type NavAccess } from "@/lib/nav-items";

export function Sidebar(access: NavAccess) {
  const pathname = usePathname();
  const items = getNavItems(access);

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar-bg text-sidebar-foreground">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/10">
        <Boxes className="h-5 w-5" strokeWidth={1.75} />
        <span className="font-semibold tracking-tight text-sm text-white">
          EgaLog HR
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const isActive = isNavItemActive(pathname, item);
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

      <div className="px-3 py-3 border-t border-white/10">
        <Link
          href="/profile"
          aria-current={pathname === "/profile" ? "page" : undefined}
          className={`flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-sm transition-colors ${
            pathname === "/profile"
              ? "bg-white/10 text-white font-medium"
              : "text-sidebar-foreground/75 hover:bg-white/5 hover:text-white"
          }`}
        >
          <User
            className={`h-4 w-4 shrink-0 ${pathname === "/profile" ? "text-sidebar-active" : ""}`}
            strokeWidth={1.75}
          />
          Profil
        </Link>
        <p className="px-3 pt-2 text-xs text-sidebar-foreground/50">
          PT EgaLog Indonesia
        </p>
      </div>
    </aside>
  );
}
