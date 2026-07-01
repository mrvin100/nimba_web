import type { PagedResponse } from "@/lib/pagination";

/** One recorded action in the audit trail. */
export interface AuditEvent {
  id: string;
  occurredAt: string;
  actorEmail: string | null;
  action: string;
  method: string;
  path: string;
  status: number;
  correlationId: string | null;
}

export type AuditPage = PagedResponse<AuditEvent>;

/** Server-side audit filters. Dates are ISO calendar days (yyyy-MM-dd), inclusive. */
export interface AuditFilters {
  from?: string;
  to?: string;
  method?: string;
  status?: number;
}
