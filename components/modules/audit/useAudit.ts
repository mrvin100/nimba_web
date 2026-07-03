"use client";

import { queryKeys } from "@/lib/query-keys";
import { usePagedQuery } from "@/lib/use-paged-query";
import { listAuditEvents } from "./audit.service";
import type { AuditFilters } from "./schema";

/** Query keys for the audit domain. */
export const auditKeys = queryKeys<AuditFilters>("audit");

/** Paginated audit trail with optional server-side filters (server state). */
export function useAuditEvents(page: number, filters: AuditFilters = {}, size = 30) {
  return usePagedQuery({
    keys: auditKeys,
    page,
    size,
    filters,
    fetch: (p, s, f) => listAuditEvents(p, s, f),
  });
}
