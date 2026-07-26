import type { Metadata } from "next";
import { getAdminNotifications } from "@/lib/notifications";
import { Card, PageHeader } from "@/components/card";

export const metadata: Metadata = { title: "Admin • Notifikasi" };
import { NotificationList } from "../../(portal)/notifikasi/notification-list";

export default async function AdminNotifikasiPage() {
  const notifs = getAdminNotifications();
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notifikasi"
        description={unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
      />
      <Card>
        <NotificationList initialNotifications={notifs} apiBase="/api/admin/notifications" />
      </Card>
    </div>
  );
}
