"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Boxes, User } from "lucide-react";
import {
  getNavItems,
  isNavItemActive,
  PRIMARY_NAV_ITEMS,
  type NavAccess,
} from "@/lib/nav-items";

export function BottomNav(access: NavAccess) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const allItems = getNavItems(access);
  // Drawer "Menu" cuma nampilin item yang BELUM ada di 4 tab bottom bar —
  // Dashboard/Absensi/Cuti/Payroll sudah bisa diakses langsung dari bawah,
  // jadi nggak perlu diulang lagi di sini (menghindari duplikasi menu).
  const overflowItems = allItems.filter(
    (item) => !PRIMARY_NAV_ITEMS.some((p) => p.href === item.href),
  );

  // Tutup drawer "Menu" otomatis setiap kali pindah halaman. Pola "adjusting
  // state during render" dari dokumentasi React (bukan di useEffect) supaya
  // tidak memicu cascading render — lihat https://react.dev/learn/you-might-not-need-an-effect
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsMenuOpen(false);
  }

  // Aksesibilitas: tutup dengan Escape, fokus ke tombol close saat drawer dibuka.
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
    overflowItems.some((item) => isNavItemActive(pathname, item)) || pathname === "/profile";

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
                <Boxes className="h-5 w-5" strokeWidth={1.75} />
                <span className="font-semibold tracking-tight text-sm text-white">
                  EgaLog HR
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
              {overflowItems.map((item) => {
                const isActive = isNavItemActive(pathname, item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
                    {item.label}
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
