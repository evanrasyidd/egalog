"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, User, ExternalLink, ChevronRight } from "lucide-react";
import { getNavEntries, isNavItemActive, isNavEntryActive, getNavEntryChildren, type NavAccess } from "@/lib/nav-items";
import { ConfirmDialog } from "./confirm-dialog";

export function Sidebar(access: NavAccess) {
  const pathname = usePathname();
  const entries = getNavEntries(access);
  const [showLogisticsConfirm, setShowLogisticsConfirm] = useState(false);
  const logisticsUrl = process.env.NEXT_PUBLIC_LOGISTICS_APP_URL ?? "#";
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const open = new Set<string>();
    for (const entry of entries) {
      if ("children" in entry && isNavEntryActive(pathname, entry)) {
        open.add(entry.href);
      }
    }
    return open;
  });

  const toggleGroup = useCallback((href: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  }, []);

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar-bg text-sidebar-foreground">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/10">
        <Boxes className="h-5 w-5" strokeWidth={1.75} />
        <span className="font-semibold tracking-tight text-sm text-white">
          EgaLog HR
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {entries.map((entry) => {
          const children = getNavEntryChildren(entry);
          if (children.length > 0) {
            const isParentActive = isNavItemActive(pathname, entry);
            const isExpanded = expandedGroups.has(entry.href) || isNavEntryActive(pathname, entry);
            const Icon = entry.icon;
            return (
              <div key={entry.href}>
                <div className="flex items-center">
                  <Link
                    href={entry.href}
                    onClick={() => toggleGroup(entry.href)}
                    aria-current={isParentActive ? "page" : undefined}
                    className={`flex items-center gap-2.5 flex-1 rounded-[8px] px-3 py-2 text-sm transition-colors ${
                      isParentActive
                        ? "bg-white/10 text-white font-medium"
                        : "text-sidebar-foreground/75 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${isParentActive ? "text-sidebar-active" : ""}`}
                      strokeWidth={1.75}
                    />
                    {entry.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleGroup(entry.href)}
                    aria-label={isExpanded ? "Tutup submenu" : "Buka submenu"}
                    className="h-8 w-8 flex items-center justify-center rounded-[6px] text-sidebar-foreground/50 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <ChevronRight
                      className={`h-3.5 w-3.5 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                </div>
                {isExpanded && (
                  <div className="ml-3 space-y-0.5 border-l border-white/10 pl-2">
                    {children.map((child) => {
                      const isChildActive = isNavItemActive(pathname, child);
                      const ChildIcon = child.icon;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          aria-current={isChildActive ? "page" : undefined}
                          className={`flex items-center gap-2 rounded-[6px] px-3 py-1.5 text-sm transition-colors ${
                            isChildActive
                              ? "bg-white/10 text-white font-medium"
                              : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <ChildIcon
                            className={`h-3.5 w-3.5 shrink-0 ${isChildActive ? "text-sidebar-active" : ""}`}
                            strokeWidth={1.75}
                          />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = isNavItemActive(pathname, entry);
          const Icon = entry.icon;
          return (
            <Link
              key={entry.href}
              href={entry.href}
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
              {entry.label}
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
        <button
          type="button"
          onClick={() => setShowLogisticsConfirm(true)}
          className="mx-3 mt-2 w-[calc(100%-1.5rem)] flex items-center gap-2 rounded-[8px] px-3 py-2 text-xs text-sidebar-foreground/60 hover:bg-white/5 hover:text-white transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
          Buka EgaLog Logistics
        </button>
        <ConfirmDialog
          open={showLogisticsConfirm}
          title="Buka EgaLog Logistics"
          message="Kamu akan meninggalkan EgaLog HR menuju aplikasi EgaLog Logistics. Lanjutkan?"
          variant="warning"
          confirmLabel="Ya, buka"
          cancelLabel="Kembali"
          onConfirm={() => {
            setShowLogisticsConfirm(false);
            window.open(logisticsUrl, "_blank", "noopener,noreferrer");
          }}
          onCancel={() => setShowLogisticsConfirm(false)}
        />
        <p className="px-3 pt-2 text-xs text-sidebar-foreground/50">
          PT EgaLog Indonesia
        </p>
      </div>
    </aside>
  );
}
