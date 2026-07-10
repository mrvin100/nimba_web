"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { QUERY_SCOPES } from "@/lib/query-keys";
import { getUnreadCount, listNotifications, markAllNotificationsRead, markNotificationRead } from "./notification.service";

export const notificationKeys = {
  all: [QUERY_SCOPES.notification] as const,
  list: (page: number) => [QUERY_SCOPES.notification, "list", page] as const,
  unreadCount: () => [QUERY_SCOPES.notification, "unread-count"] as const,
};

/** The bell's dropdown list (server state). */
export function useNotifications(page = 0) {
  return useQuery({
    queryKey: notificationKeys.list(page),
    queryFn: () => listNotifications(page),
  });
}

/**
 * The unread badge count. No push channel exists yet, so this polls — 30s keeps the
 * badge close to live without hammering the backend.
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  return useApiMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    invalidate: [notificationKeys.all],
  });
}

export function useMarkAllNotificationsRead() {
  return useApiMutation({
    mutationFn: markAllNotificationsRead,
    invalidate: [notificationKeys.all],
  });
}
