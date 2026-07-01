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
