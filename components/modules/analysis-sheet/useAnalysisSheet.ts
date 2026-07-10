"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { QUERY_SCOPES } from "@/lib/query-keys";
import { createAnalysisSheet, getAnalysisSheet, publishAnalysisSheet, updateAnalysisSheetContent } from "./analysis-sheet.service";
import type { AnalysisSheetContentInput } from "./schema";

export const analysisSheetKeys = {
  all: [QUERY_SCOPES.analysisSheet] as const,
  detail: (caseId: string) => [QUERY_SCOPES.analysisSheet, caseId] as const,
};

/**
 * The case's FA. A 404 (none initiated yet) resolves to `null`, matching the
 * amortization module's schedule/overview convention — the panel renders its
 * "not started" state instead of an error.
 */
export function useAnalysisSheet(caseId: string) {
  return useQuery({
    queryKey: analysisSheetKeys.detail(caseId),
    queryFn: () => getAnalysisSheet(caseId).catch(() => null),
  });
}

/** Initiates the FA in draft; a rejection (TA missing, already exists) is toasted. */
export function useCreateAnalysisSheet(caseId: string) {
  return useApiMutation({
    mutationFn: () => createAnalysisSheet(caseId),
    invalidate: [analysisSheetKeys.detail(caseId)],
    errorToast: true,
  });
}

/** Saves the draft content. */
export function useUpdateAnalysisSheetContent(caseId: string) {
  return useApiMutation({
    mutationFn: (input: AnalysisSheetContentInput) => updateAnalysisSheetContent(caseId, input),
    invalidate: [analysisSheetKeys.detail(caseId)],
    successToast: "Fiche d'analyse enregistrée",
    errorToast: true,
  });
}

/** Publishes the FA, locking it and signalling the dossier is ready for revue DCM. */
export function usePublishAnalysisSheet(caseId: string) {
  return useApiMutation({
    mutationFn: () => publishAnalysisSheet(caseId),
    invalidate: [analysisSheetKeys.detail(caseId)],
    successToast: "Fiche d'analyse publiée",
    errorToast: true,
  });
}
