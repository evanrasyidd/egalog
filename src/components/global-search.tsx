"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Users, Megaphone, Loader2 } from "lucide-react";
import type { SearchResult } from "@/lib/types";

const TYPE_CONFIG: Record<string, { icon: typeof Users; label: string }> = {
  karyawan: { icon: Users, label: "Karyawan" },
  pengumuman: { icon: Megaphone, label: "Pengumuman" },
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => {
          setResults(d.results);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  function handleSelect() {
    setIsOpen(false);
    setQuery("");
  }

  return (
    <div className="relative hidden sm:block" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
        <input
          ref={inputRef}
          type="search"
          placeholder="Cari karyawan..."
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setIsOpen(true);
            if (value.trim()) {
              setLoading(true);
            } else {
              setResults([]);
              setLoading(false);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="h-9 w-56 lg:w-72 rounded-[8px] border border-border bg-surface px-9 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" strokeWidth={1.75} />
        )}
      </div>

      {isOpen && query.trim() && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-[10px] shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {loading ? "Mencari..." : "Tidak ditemukan."}
            </p>
          ) : (
            results.map((r, i) => {
              const config = TYPE_CONFIG[r.type] ?? { icon: Search, label: r.type };
              const Icon = config.icon;
              return (
                <Link
                  key={`${r.type}-${i}`}
                  href={r.link}
                  onClick={handleSelect}
                  className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-surface-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.description}</p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
