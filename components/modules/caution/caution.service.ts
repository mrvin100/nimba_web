import { api } from "@/lib/api-client";
import { env } from "@/lib/env";
import type { PagedResponse } from "@/lib/pagination";
import type {
  Caution,
  CautionDocumentType,
  CautionDocumentTypeInfo,
  CautionDossier,
  CautionDossierDetail,
  CreateCautionInput,
  CreateDossierInput,
  DocumentVersion,
  DossierEvent,
  SuggestedSequence,
  UpdateCautionInput,
  UpdateDossierInput,
} from "./schema";

/** The generic document engine's metadata — drives the dynamic creation form, never hardcoded per type. */
export function listCautionDocumentTypes(): Promise<CautionDocumentTypeInfo[]> {
  return api.get("cautions/document-types").json<CautionDocumentTypeInfo[]>();
}

/** The next free number in documentType's own series — pre-fills the create form's editable sequence field. */
export function getNextSequence(documentType: CautionDocumentType): Promise<SuggestedSequence> {
  return api.get("cautions/next-sequence", { searchParams: { documentType } }).json<SuggestedSequence>();
}

/** The next free number in the dossier series. */
export function getNextDossierSequence(): Promise<SuggestedSequence> {
  return api.get("caution-dossiers/next-sequence").json<SuggestedSequence>();
}

/** Opens a caution in draft; the reference number is assigned immediately (409 on a missing required field). */
export function createCaution(input: CreateCautionInput): Promise<Caution> {
  return api.post("cautions", { json: input }).json<Caution>();
}

/** Replaces a draft's field answers (409 once the caution is FINAL). */
export function updateCaution(id: string, input: UpdateCautionInput): Promise<Caution> {
  return api.put(`cautions/${id}`, { json: input }).json<Caution>();
}

/** Deletes a document (refused when its dossier is locked). */
export async function deleteCaution(id: string): Promise<void> {
  await api.delete(`cautions/${id}`);
}

/** A document's edit history, newest first. */
export function documentHistory(id: string): Promise<DocumentVersion[]> {
  return api.get(`cautions/${id}/history`).json<DocumentVersion[]>();
}

/** Same-origin URL of the Word (.docx) export of a document. */
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

/** Finalizes the request: freezes every document and locks the dossier. */
export function finalizeDossier(id: string): Promise<CautionDossier> {
  return api.post(`caution-dossiers/${id}/finalize`).json<CautionDossier>();
}

/** Reopens a finalized dossier to correct a document (manager-only); the reason is journaled. */
export function prorogeDossier(id: string, reason: string): Promise<CautionDossier> {
  return api.post(`caution-dossiers/${id}/proroge`, { json: { reason } }).json<CautionDossier>();
}

/** Re-locks a prorogated dossier once the correction is done. */
export function refinalizeDossier(id: string): Promise<CautionDossier> {
  return api.post(`caution-dossiers/${id}/refinalize`).json<CautionDossier>();
}

/** Deletes a dossier and every document it holds (only while still a draft; admin-only). */
export async function deleteDossier(id: string): Promise<void> {
  await api.delete(`caution-dossiers/${id}`);
}

/** A dossier's lifecycle journal, newest first. */
export function dossierEvents(id: string): Promise<DossierEvent[]> {
  return api.get(`caution-dossiers/${id}/events`).json<DossierEvent[]>();
}

/** Same-origin URL of the dossier's Notification de caution (.docx). */
export function dossierNotificationPath(id: string): string {
  return `${env.apiBasePath}/caution-dossiers/${id}/notification/docx`;
}

/** Same-origin URL of the dossier's Fiche d'approbation (.docx). */
export function dossierFichePath(id: string): string {
  return `${env.apiBasePath}/caution-dossiers/${id}/fiche/docx`;
}
