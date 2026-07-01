"use client";

import { useQuery } from "@tanstack/react-query";
import { listAuditEvents } from "./audit-service";
import type { AuditFilters } from "./schema";

export const auditKeys = {
  list: (page: number, size: number, filters: AuditFilters) => ["audit", "list", page, size, filters] as const,
};

/** Paginated audit trail with optional server-side filters (server state). */
export function useAuditEvents(page: number, filters: AuditFilters = {}, size = 30) {
  return useQuery({
    queryKey: auditKeys.list(page, size, filters),
    queryFn: () => listAuditEvents(page, size, filters),
  });
}
