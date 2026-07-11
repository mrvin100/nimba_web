"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { QUERY_SCOPES } from "@/lib/query-keys";
import { createAnalysisSheet, getAnalysisSheet, getFaSections, publishAnalysisSheet, updateFaSection } from "./analysis-sheet.service";
import type { FaSection, FaSectionKey } from "./schema";

export const analysisSheetKeys = {
  all: [QUERY_SCOPES.analysisSheet] as const,
  detail: (caseId: string) => [QUERY_SCOPES.analysisSheet, caseId] as const,
  sections: (caseId: string) => [QUERY_SCOPES.analysisSheet, caseId, "sections"] as const,
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
    invalidate: [analysisSheetKeys.detail(caseId), analysisSheetKeys.sections(caseId)],
    errorToast: true,
  });
}

/** Every section that applies to the case's FA variant, enabled once the FA exists. */
export function useFaSections(caseId: string, enabled: boolean) {
  return useQuery({
    queryKey: analysisSheetKeys.sections(caseId),
    queryFn: () => getFaSections(caseId),
    enabled,
  });
}

/** Saves one section's content; write-through updates just that row in the sections cache. */
export function useUpdateFaSection(caseId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: ({ key, contentJson }: { key: FaSectionKey; contentJson: string | null }) =>
      updateFaSection(caseId, key, contentJson),
    successToast: "Section enregistrée",
    errorToast: true,
    onSuccess: (data) => {
      queryClient.setQueryData<FaSection[]>(analysisSheetKeys.sections(caseId), (sections) =>
        sections?.map((section) => (section.key === data.key ? data : section)),
      );
    },
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
