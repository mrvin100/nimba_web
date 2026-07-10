import { api } from "@/lib/api-client";
import type { AnalysisSheet, AnalysisSheetContentInput } from "./schema";

const basePath = (caseId: string) => `credit-cases/${caseId}/analysis-sheet`;

/** The case's FA; throws a 404 ApiError while none has been initiated yet. */
export function getAnalysisSheet(caseId: string): Promise<AnalysisSheet> {
  return api.get(basePath(caseId)).json<AnalysisSheet>();
}

/** Initiates the FA in draft (409 if the TA is missing, or an FA already exists). */
export function createAnalysisSheet(caseId: string): Promise<AnalysisSheet> {
  return api.post(basePath(caseId)).json<AnalysisSheet>();
}

/** Replaces the draft content (409 once the FA is published). */
export function updateAnalysisSheetContent(caseId: string, input: AnalysisSheetContentInput): Promise<AnalysisSheet> {
  return api.put(basePath(caseId), { json: input }).json<AnalysisSheet>();
}

/** Locks the FA (409 if already published). */
export function publishAnalysisSheet(caseId: string): Promise<AnalysisSheet> {
  return api.post(`${basePath(caseId)}/publish`).json<AnalysisSheet>();
}
