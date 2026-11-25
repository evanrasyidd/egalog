"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, ExternalLink, ChevronRight } from "lucide-react";
import { BrandLogo } from "./brand";
import {
  getNavEntries,
  isNavItemActive,
  isNavEntryActive,
  getNavEntryChildren,
  PRIMARY_NAV_ITEMS,
  type NavAccess,
  type NavEntry,
  type NavItem,
} from "@/lib/nav-items";
import { ConfirmDialog } from "./confirm-dialog";

export function BottomNav(access: NavAccess) {
  const pathname = usePathname();
  const allEntries = getNavEntries(access);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [showLogisticsConfirm, setShowLogisticsConfirm] = useState(false);
  const logisticsUrl = process.env.NEXT_PUBLIC_LOGISTICS_APP_URL ?? "#";
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const open = new Set<string>();
    for (const entry of allEntries) {
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

  const primaryHrefs = new Set(PRIMARY_NAV_ITEMS.map((p) => p.href));

  const hiddenPrimaryChildren: NavItem[] = [];
  for (const entry of allEntries) {
    if (primaryHrefs.has(entry.href)) {
      const children = getNavEntryChildren(entry);
      if (children.length > 0) hiddenPrimaryChildren.push(...children);
    }
  }

  const overflowEntries = allEntries.filter(
    (entry) => !primaryHrefs.has(entry.href),
  );
  const drawerEntries: NavEntry[] = [...overflowEntries, ...hiddenPrimaryChildren];

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsMenuOpen(false);
  }

  useEffect(() => {
    if (!isMenuOpen) return;
    closeButtonRef.current?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const isMenuActive =
    drawerEntries.some((entry) => isNavEntryActive(pathname, entry)) || pathname === "/profile";

  return (
    <>
      <nav
        aria-label="Navigasi utama"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 flex bg-sidebar-bg border-t border-white/10"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {PRIMARY_NAV_ITEMS.map((item) => {
          const isActive = isNavItemActive(pathname, item);
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
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Buka menu lainnya"
          aria-expanded={isMenuOpen}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] transition-colors ${
            isMenuActive ? "text-sidebar-active" : "text-sidebar-foreground/65"
          }`}
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
          Menu
        </button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="relative w-72 max-w-[85vw] h-full flex flex-col bg-sidebar-bg text-sidebar-foreground shadow-xl"
          >
            <div className="h-16 flex items-center justify-between gap-2.5 px-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <BrandLogo tone="reversed" className="h-[22px] w-auto" />
                <span className="rounded-[3px] border border-white/20 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-sidebar-foreground/75">
                  HR
                </span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Tutup menu"
                className="h-8 w-8 flex items-center justify-center rounded-[8px] text-sidebar-foreground/75 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {drawerEntries.map((entry) => {
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
                          className={`flex items-center gap-2.5 flex-1 rounded-[8px] px-3 py-2.5 text-sm transition-colors ${
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
                    className={`flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-sm transition-colors ${
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

            <div className="px-3 py-3 border-t border-white/10 shrink-0">
              <Link
                href="/profile"
                aria-current={pathname === "/profile" ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-sm transition-colors ${
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
          </div>
        </div>
      )}
    </>
  );
}