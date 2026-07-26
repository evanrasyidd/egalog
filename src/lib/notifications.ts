import "server-only";
import { notifications, nextNotificationId, employees } from "./db";
import type { Notification, NotificationType } from "./types";

export function createNotification(
  type: NotificationType,
  targetEmployeeId: string | null,
  title: string,
  message: string,
  link: string | null = null,
): Notification {
  const notif: Notification = {
    id: nextNotificationId(),
    type,
    targetEmployeeId,
    title,
    message,
    link,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  notifications.push(notif);
  return notif;
}

export function createNotificationForAll(
  type: NotificationType,
  title: string,
  message: string,
  link: string | null = null,
): Notification[] {
  return employees
    .filter((e) => e.isActive)
    .map((e) => createNotification(type, e.id, title, message, link));
}

export function getNotificationsForEmployee(employeeId: string): Notification[] {
  return notifications
    .filter((n) => n.targetEmployeeId === null || n.targetEmployeeId === employeeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUnreadNotificationCount(employeeId: string): number {
  return notifications.filter(
    (n) => (n.targetEmployeeId === null || n.targetEmployeeId === employeeId) && !n.isRead,
  ).length;
}

export function markNotificationAsRead(notificationId: string, employeeId: string): boolean {
  const notif = notifications.find((n) => n.id === notificationId);
  if (!notif) return false;
  if (notif.targetEmployeeId !== null && notif.targetEmployeeId !== employeeId) return false;
  notif.isRead = true;
  return true;
}

export function markAllNotificationsAsRead(employeeId: string): void {
  for (const n of notifications) {
    if ((n.targetEmployeeId === null || n.targetEmployeeId === employeeId) && !n.isRead) {
      n.isRead = true;
    }
  }
}

export function getUnreadCountAll(): number {
  return notifications.filter((n) => !n.isRead).length;
}

export function getAdminNotifications(): Notification[] {
  return notifications
    .filter((n) => n.targetEmployeeId === null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUnreadAdminNotificationCount(): number {
  return notifications.filter((n) => n.targetEmployeeId === null && !n.isRead).length;
}

export function markAdminNotificationAsRead(notificationId: string): boolean {
  const notif = notifications.find((n) => n.id === notificationId);
  if (!notif || notif.targetEmployeeId !== null) return false;
  notif.isRead = true;
  return true;
}

export function markAllAdminNotificationsAsRead(): void {
  for (const n of notifications) {
    if (n.targetEmployeeId === null && !n.isRead) {
      n.isRead = true;
    }
  }
}
