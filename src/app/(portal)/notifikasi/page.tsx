import type { Metadata } from "next";
import { getCurrentEmployee } from "@/lib/current-employee";
import { getNotificationsForEmployee } from "@/lib/notifications";

export const metadata: Metadata = { title: "Notifikasi" };
import { Card, PageHeader } from "@/components/card";
import { NotificationList } from "./notification-list";

export default async function NotifikasiPage() {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  const notifs = getNotificationsForEmployee(employee.id);
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notifikasi"
        description={unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
      />
      <Card>
        <NotificationList initialNotifications={notifs} />
      </Card>
    </div>
  );
}
