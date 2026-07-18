import { api } from "@/lib/api-client";
import { env } from "@/lib/env";
import type { AnalysisSheet, FaSection, FaSectionImage, FaSectionKey } from "./schema";

const basePath = (caseId: string) => `credit-cases/${caseId}/analysis-sheet`;

/** The case's FA; throws a 404 ApiError while none has been initiated yet. */
export function getAnalysisSheet(caseId: string): Promise<AnalysisSheet> {
  return api.get(basePath(caseId)).json<AnalysisSheet>();
}

/** Initiates the FA in draft (409 if the TA is missing, or an FA already exists). */
export function createAnalysisSheet(caseId: string): Promise<AnalysisSheet> {
  return api.post(basePath(caseId)).json<AnalysisSheet>();
}

/** Every section that applies to the case's FA variant, whether or not content was saved to it yet. */
export function getFaSections(caseId: string): Promise<FaSection[]> {
  return api.get(`${basePath(caseId)}/sections`).json<FaSection[]>();
}

/** Replaces one editable section's content (409 once the FA is published). */
export function updateFaSection(caseId: string, key: FaSectionKey, contentJson: string | null): Promise<FaSection> {
  return api.put(`${basePath(caseId)}/sections/${key}`, { json: { contentJson } }).json<FaSection>();
}

/** Locks the FA (409 if already published). */
export function publishAnalysisSheet(caseId: string): Promise<AnalysisSheet> {
  return api.post(`${basePath(caseId)}/publish`).json<AnalysisSheet>();
}

/** Uploads one figure to an IMAGE section; returns the section's refreshed image list. */
export function uploadFaSectionImage(
  caseId: string,
  key: FaSectionKey,
  file: File,
  caption?: string,
): Promise<FaSectionImage[]> {
  const body = new FormData();
  body.append("file", file);
  if (caption) body.append("caption", caption);
  return api.post(`${basePath(caseId)}/sections/${key}/images`, { body }).json<FaSectionImage[]>();
}

/** Removes one figure from an IMAGE section; returns the section's refreshed image list. */
export function deleteFaSectionImage(caseId: string, key: FaSectionKey, imageId: string): Promise<FaSectionImage[]> {
  return api.delete(`${basePath(caseId)}/sections/${key}/images/${imageId}`).json<FaSectionImage[]>();
}

/** Same-origin URL of one uploaded figure, rendered inline with the session cookie. */
export function faSectionImagePath(caseId: string, key: FaSectionKey, imageId: string): string {
  return `${env.apiBasePath}/${basePath(caseId)}/sections/${key}/images/${imageId}`;
}

/**
 * Same-origin URL of the Word (.docx) export of the FA's current completion
 * state — RAS for anything not yet captured. Used as an anchor href so the
 * browser downloads it directly with the session cookie (no blob handling
 * needed). Works even before the FA has been initiated.
 */
export function analysisSheetDocxExportPath(caseId: string): string {
  return `${env.apiBasePath}/${basePath(caseId)}/export/docx`;
}
