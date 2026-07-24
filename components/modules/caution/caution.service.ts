import { api } from "@/lib/api-client";
import { env } from "@/lib/env";
import type { PagedResponse } from "@/lib/pagination";
import type {
  Caution,
  CautionDocumentType,
  CautionDocumentTypeInfo,
  CautionStatus,
  CautionSummary,
  CreateCautionInput,
  UpdateCautionInput,
} from "./schema";

/** The generic document engine's metadata — drives the dynamic creation form, never hardcoded per type. */
export function listCautionDocumentTypes(): Promise<CautionDocumentTypeInfo[]> {
  return api.get("cautions/document-types").json<CautionDocumentTypeInfo[]>();
}

/** Lists cautions, newest first (paginated); every filter is optional. */
export function listCautions(
  page = 0,
  size = 20,
  filters: { clientId?: string; documentType?: CautionDocumentType; status?: CautionStatus } = {},
): Promise<PagedResponse<CautionSummary>> {
  const searchParams: Record<string, string | number> = { page, size };
  if (filters.clientId) searchParams.clientId = filters.clientId;
  if (filters.documentType) searchParams.documentType = filters.documentType;
  if (filters.status) searchParams.status = filters.status;
  return api.get("cautions", { searchParams }).json<PagedResponse<CautionSummary>>();
}

/** Resolves a single caution by id. */
export function getCaution(id: string): Promise<Caution> {
  return api.get(`cautions/${id}`).json<Caution>();
}

/** Opens a caution in draft; the reference number is assigned immediately (409 on a missing required field). */
export function createCaution(input: CreateCautionInput): Promise<Caution> {
  return api.post("cautions", { json: input }).json<Caution>();
}

/** Replaces a draft's field answers (409 once the caution is FINAL). */
export function updateCaution(id: string, input: UpdateCautionInput): Promise<Caution> {
  return api.put(`cautions/${id}`, { json: input }).json<Caution>();
}

/** Locks the caution, freezing the issuing client's identity. */
export function finalizeCaution(id: string): Promise<Caution> {
  return api.post(`cautions/${id}/finalize`).json<Caution>();
}

/** Deletes a draft caution (409 if already finalized — it is an official record). */
export async function deleteCaution(id: string): Promise<void> {
  await api.delete(`cautions/${id}`);
}

/** Same-origin URL of the Word (.docx) export of a finalized caution. */
export function cautionDocxExportPath(id: string): string {
  return `${env.apiBasePath}/cautions/${id}/export/docx`;
}
