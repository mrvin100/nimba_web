import { api } from "@/lib/api-client";
import { env } from "@/lib/env";
import type { CreatePvInput, Pv, UpdatePvDraftInput } from "./schema";

const basePath = (caseId: string) => `credit-cases/${caseId}/pv`;

/** The case's PV; throws a 404 ApiError while none has been generated yet. */
export function getPv(caseId: string): Promise<Pv> {
  return api.get(basePath(caseId)).json<Pv>();
}

/** Opens the PV in draft (409 if the dossier isn't APPROUVE yet, or a PV already exists). */
export function createPv(caseId: string, input: CreatePvInput): Promise<Pv> {
  return api.post(basePath(caseId), { json: input }).json<Pv>();
}

/** Replaces the draft's editable fields (409 once the PV is final). */
export function updatePvDraft(caseId: string, input: UpdatePvDraftInput): Promise<Pv> {
  return api.put(basePath(caseId), { json: input }).json<Pv>();
}

/** Locks the PV, freezing a snapshot of the dossier's current data (409 if already final). */
export function finalizePv(caseId: string): Promise<Pv> {
  return api.post(`${basePath(caseId)}/finalize`).json<Pv>();
}

/**
 * Same-origin URL of the Word (.docx) export of the case's finalized PV. Used
 * as an anchor href so the browser downloads it directly with the session
 * cookie. Only reachable once the PV is FINAL — a draft has no snapshot to
 * print (409 otherwise), unlike the FA export.
 */
export function pvDocxExportPath(caseId: string): string {
  return `${env.apiBasePath}/${basePath(caseId)}/export/docx`;
}
