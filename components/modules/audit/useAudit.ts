"use client";

import { useQuery } from "@tanstack/react-query";
import { listAuditEvents } from "./audit-service";

export const auditKeys = {
  list: (page: number, size: number) => ["audit", "list", page, size] as const,
};

/** Paginated audit trail (server state). */
export function useAuditEvents(page: number, size = 30) {
  return useQuery({
    queryKey: auditKeys.list(page, size),
    queryFn: () => listAuditEvents(page, size),
  });
}
