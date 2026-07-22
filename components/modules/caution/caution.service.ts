import { api } from "@/lib/api-client";
import { env } from "@/lib/env";
import type { PagedResponse } from "@/lib/pagination";
import type {
  Caution,
  CautionDocumentType,
  CautionDocumentTypeInfo,
  CautionDossier,
  CautionDossierDetail,
  CautionStatus,
  CautionSummary,
  CreateCautionInput,
  CreateDossierInput,
  ReferenceSequenceStatus,
  UpdateCautionInput,
  UpdateDossierInput,
} from "./schema";

/** The generic document engine's metadata — drives the dynamic creation form, never hardcoded per type. */
export function listCautionDocumentTypes(): Promise<CautionDocumentTypeInfo[]> {
  return api.get("cautions/document-types").json<CautionDocumentTypeInfo[]>();
}

/** Whether the create form should still offer a starting-sequence override (only before the very first caution ever created). */
export function getReferenceSequenceStatus(): Promise<ReferenceSequenceStatus> {
  return api.get("cautions/reference-sequence-status").json<ReferenceSequenceStatus>();
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

/** Lists caution dossiers, newest first (paginated); the client filter is optional. */
export function listDossiers(page = 0, size = 20, clientId?: string): Promise<PagedResponse<CautionDossier>> {
  const searchParams: Record<string, string | number> = { page, size };
  if (clientId) searchParams.clientId = clientId;
  return api.get("caution-dossiers", { searchParams }).json<PagedResponse<CautionDossier>>();
}

/** A dossier together with the documents attached to it. */
export function getDossier(id: string): Promise<CautionDossierDetail> {
  return api.get(`caution-dossiers/${id}`).json<CautionDossierDetail>();
}

/** Opens a dossier; its reference number is assigned immediately. */
export function createDossier(input: CreateDossierInput): Promise<CautionDossier> {
  return api.post("caution-dossiers", { json: input }).json<CautionDossier>();
}

/** Replaces a dossier's shared content (the fields its documents and companions reuse). */
export function updateDossier(id: string, input: UpdateDossierInput): Promise<CautionDossier> {
  return api.put(`caution-dossiers/${id}`, { json: input }).json<CautionDossier>();
}

/** Same-origin URL of the dossier's Notification de caution (.docx). */
export function dossierNotificationPath(id: string): string {
  return `${env.apiBasePath}/caution-dossiers/${id}/notification/docx`;
}

/** Same-origin URL of the dossier's Fiche d'approbation (.docx). */
export function dossierFichePath(id: string): string {
  return `${env.apiBasePath}/caution-dossiers/${id}/fiche/docx`;
}
