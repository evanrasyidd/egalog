"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import type { Notification } from "@/lib/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}

const TYPE_ICON_CLASS: Record<string, string> = {
  leave_requested: "bg-warning/10 text-warning",
  leave_approved: "bg-success/10 text-success",
  leave_rejected: "bg-danger/10 text-danger",
  payroll_generated: "bg-success/10 text-success",
  review_submitted: "bg-primary/10 text-primary",
  announcement: "bg-accent/10 text-accent",
};

export function NotificationBell({
  apiBase = "/api/notifications",
  listLink = "/notifikasi",
}: {
  apiBase?: string;
  listLink?: string;
}) {
  const [unread, setUnread] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${apiBase}/unread-count`)
      .then((r) => r.json())
      .then((d) => setUnread(d.count))
      .catch(() => setUnread(0));
  }, [apiBase]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(apiBase)
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isOpen, apiBase]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  async function handleMarkAllRead() {
    await fetch(`${apiBase}/read-all`, { method: "POST" });
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  async function handleMarkRead(id: string) {
    await fetch(`${apiBase}/${id}`, { method: "PATCH" });
    setUnread((prev) => Math.max(0, (prev ?? 0) - 1));
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifikasi${unread && unread > 0 ? ` (${unread} belum dibaca)` : ""}`}
        className="relative h-9 w-9 flex items-center justify-center rounded-[8px] text-muted-foreground hover:bg-surface-muted transition-colors"
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {unread !== null && unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
        {unread === null && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-muted-foreground/50" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface border border-border rounded-[10px] shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-medium">Notifikasi</p>
            <div className="flex items-center gap-2">
              {unread !== null && unread > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:underline"
                >
                  Tandai semua dibaca
                </button>
              )}
              <Link
                href={listLink}
                className="text-xs text-primary hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Lihat semua
              </Link>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" strokeWidth={1.75} />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Tidak ada notifikasi.</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors cursor-pointer ${!n.isRead ? "bg-primary/5" : ""}`}
                  onClick={() => {
                    if (!n.isRead) handleMarkRead(n.id);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${TYPE_ICON_CLASS[n.type] ?? "bg-surface-muted text-muted-foreground"}`}>
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <span className="text-xs text-muted-foreground shrink-0">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <div className="h-2 w-2 rounded-full bg-accent shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
