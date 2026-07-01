import { api } from "@/lib/api-client";
import type { AuditPage } from "./schema";

/** Lists audit events, newest first (paginated). */
export function listAuditEvents(page = 0, size = 30): Promise<AuditPage> {
  return api.get("admin/audit", { searchParams: { page, size } }).json<AuditPage>();
}
