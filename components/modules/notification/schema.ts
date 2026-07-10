export interface NotificationItem {
  id: string;
  creditCaseId: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UnreadCount {
  count: number;
}

export type { PagedResponse } from "@/lib/pagination";
