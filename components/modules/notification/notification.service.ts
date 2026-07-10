import { api } from "@/lib/api-client";
import type { NotificationItem, PagedResponse, UnreadCount } from "./schema";

/** The caller's notifications, newest first. */
export function listNotifications(page = 0, size = 20): Promise<PagedResponse<NotificationItem>> {
  return api.get("notifications", { searchParams: { page, size } }).json<PagedResponse<NotificationItem>>();
}

export function getUnreadCount(): Promise<UnreadCount> {
  return api.get("notifications/unread-count").json<UnreadCount>();
}

export function markNotificationRead(id: string): Promise<NotificationItem> {
  return api.post(`notifications/${id}/read`).json<NotificationItem>();
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post("notifications/read-all");
}
