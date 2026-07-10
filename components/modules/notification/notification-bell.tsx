"use client";

import { Bell, CheckCheck } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications, useUnreadCount } from "./useNotification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * The workspace shell's bell: unread count (polled, no push channel exists yet),
 * a dropdown of the caller's own notifications, and a mark-all-read action. Reused
 * identically across every workspace — the backend already scopes every response to
 * the caller.
 */
export function NotificationBell() {
  const { data: unread } = useUnreadCount();
  const { data: page, isPending } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const count = unread?.count ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={count > 0 ? `Notifications (${count} non lues)` : "Notifications"}>
          <Bell />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
            >
              {count > 9 ? "9+" : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <span className="text-sm font-medium">Notifications</span>
          {count > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
              <CheckCheck />
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isPending ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !page || page.content.length === 0 ? (
            <Empty className="border-0 py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Bell />
                </EmptyMedia>
                <EmptyTitle>Aucune notification</EmptyTitle>
                <EmptyDescription>Vous serez averti ici des dossiers qui attendent votre action.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul>
              {page.content.map((notification) => (
                <li
                  key={notification.id}
                  className={cn(
                    "border-b p-3 text-sm last:border-b-0",
                    !notification.read && "cursor-pointer bg-accent/40 hover:bg-accent",
                  )}
                  onClick={() => !notification.read && markRead.mutate(notification.id)}
                >
                  <p className={cn(!notification.read && "font-medium")}>{notification.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
