"use client";

import { useEffect, useRef, useState } from "react";
import { KeyRound, X } from "lucide-react";

const DEMO_ACCOUNTS = [
  { role: "Owner", email: "raka@egalog.co.id" },
  { role: "Direktur", email: "bimo@egalog.co.id" },
  { role: "Manager", email: "fajar@egalog.co.id" },
  { role: "Supervisor", email: "andi@egalog.co.id" },
  { role: "Staff", email: "dedi@egalog.co.id" },
];

export function DemoAccountsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
      >
        <KeyRound className="h-3.5 w-3.5" strokeWidth={1.75} />
        Lihat Akun Demo
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Akun demo"
          className="absolute z-20 bottom-full mb-2 left-0 w-72 rounded-[10px] border border-border bg-surface shadow-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium">
              Password sama untuk semua: <span className="font-mono">egalog123</span>
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup"
              className="h-6 w-6 flex items-center justify-center rounded-[6px] text-muted-foreground hover:bg-surface-muted transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
          <ul className="grid grid-cols-1 gap-1 text-xs font-mono text-foreground/80">
            {DEMO_ACCOUNTS.map((acc) => (
              <li key={acc.email} className="flex justify-between gap-3">
                <span className="text-muted-foreground font-sans">{acc.role}</span>
                <span>{acc.email}</span>
              </li>
            ))}
          </ul>

          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs font-medium mb-1.5">
              Admin Sistem (password beda):{" "}
              <span className="font-mono">EgaLogAdmin123</span>
            </p>
            <div className="flex justify-between gap-3 text-xs font-mono text-foreground/80">
              <span className="text-muted-foreground font-sans">Username</span>
              <span>admin</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
