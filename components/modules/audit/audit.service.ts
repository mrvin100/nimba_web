import { api } from "@/lib/api-client";
import type { AuditFilters, AuditPage } from "./schema";

/** Lists audit events, newest first (paginated, optionally filtered server-side). */
export function listAuditEvents(page = 0, size = 30, filters: AuditFilters = {}): Promise<AuditPage> {
  const searchParams: Record<string, string | number> = { page, size };
  if (filters.from) searchParams.from = filters.from;
  if (filters.to) searchParams.to = filters.to;
  if (filters.method) searchParams.method = filters.method;
  if (filters.status != null) searchParams.status = filters.status;
  return api.get("admin/audit", { searchParams }).json<AuditPage>();
}
