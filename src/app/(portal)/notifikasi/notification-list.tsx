"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCheck, ExternalLink } from "lucide-react";
import type { Notification } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  leave_requested: "Pengajuan Cuti",
  leave_approved: "Cuti Disetujui",
  leave_rejected: "Cuti Ditolak",
  payroll_generated: "Payroll",
  review_submitted: "Performance Review",
  goal_assigned: "Goal/KPI",
  announcement: "Pengumuman",
};

const TYPE_CLASS: Record<string, string> = {
  leave_requested: "bg-warning/10 text-warning border-warning/25",
  leave_approved: "bg-success/10 text-success border-success/25",
  leave_rejected: "bg-danger/10 text-danger border-danger/25",
  payroll_generated: "bg-success/10 text-success border-success/25",
  review_submitted: "bg-primary/10 text-primary border-primary/25",
  announcement: "bg-accent/10 text-accent border-accent/25",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export function NotificationList({ initialNotifications, apiBase = "/api/notifications" }: { initialNotifications: Notification[]; apiBase?: string }) {
  const [notifs, setNotifs] = useState(initialNotifications);

  async function markAllRead() {
    await fetch(`${apiBase}/read-all`, { method: "POST" });
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  async function markRead(id: string) {
    await fetch(`${apiBase}/${id}`, { method: "PATCH" });
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  const unread = notifs.filter((n) => !n.isRead);

  return (
    <div>
      {unread.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{unread.length} belum dibaca</p>
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <CheckCheck className="h-4 w-4" strokeWidth={1.75} />
            Tandai semua dibaca
          </button>
        </div>
      )}

      {notifs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Belum ada notifikasi.</p>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <div
              key={n.id}
              className={`rounded-[10px] border p-4 transition-colors ${n.isRead ? "border-border" : "border-primary/20 bg-primary/5"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TYPE_CLASS[n.type]}`}>
                      {TYPE_LABEL[n.type] ?? n.type}
                    </span>
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-accent shrink-0" />}
                  </div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{timeAgo(n.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {n.link && (
                    <Link
                      href={n.link}
                      className="h-8 w-8 flex items-center justify-center rounded-[8px] text-muted-foreground hover:bg-surface-muted transition-colors"
                      aria-label="Lihat detail"
                    >
                      <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                    </Link>
                  )}
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className="text-xs text-primary hover:underline shrink-0"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
