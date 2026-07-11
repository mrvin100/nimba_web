import { api } from "@/lib/api-client";
import type { AnalysisSheet, FaSection, FaSectionKey } from "./schema";

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
