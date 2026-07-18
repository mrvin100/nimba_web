"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { QUERY_SCOPES } from "@/lib/query-keys";
import {
  createAnalysisSheet,
  deleteFaSectionImage,
  getAnalysisSheet,
  getFaSections,
  publishAnalysisSheet,
  unpublishAnalysisSheet,
  updateFaSection,
  uploadFaSectionImage,
} from "./analysis-sheet.service";
import type { FaSection, FaSectionImage, FaSectionKey } from "./schema";

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

/** Write-through: replaces one section's image list in the sections cache. */
function useSectionImagesWriteThrough(caseId: string) {
  const queryClient = useQueryClient();
  return (key: FaSectionKey, images: FaSectionImage[]) => {
    queryClient.setQueryData<FaSection[]>(analysisSheetKeys.sections(caseId), (sections) =>
      sections?.map((section) => (section.key === key ? { ...section, images } : section)),
    );
  };
}

/** Uploads one figure to an IMAGE section (409 once published, 400 outside IMAGE sections). */
export function useUploadFaSectionImage(caseId: string) {
  const writeThrough = useSectionImagesWriteThrough(caseId);
  return useApiMutation({
    mutationFn: ({ key, file, caption }: { key: FaSectionKey; file: File; caption?: string }) =>
      uploadFaSectionImage(caseId, key, file, caption).then((images) => ({ key, images })),
    successToast: "Image ajoutée",
    errorToast: true,
    onSuccess: ({ key, images }) => writeThrough(key, images),
  });
}

/** Removes one figure from an IMAGE section. */
export function useDeleteFaSectionImage(caseId: string) {
  const writeThrough = useSectionImagesWriteThrough(caseId);
  return useApiMutation({
    mutationFn: ({ key, imageId }: { key: FaSectionKey; imageId: string }) =>
      deleteFaSectionImage(caseId, key, imageId).then((images) => ({ key, images })),
    successToast: "Image supprimée",
    errorToast: true,
    onSuccess: ({ key, images }) => writeThrough(key, images),
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

/** Takes the FA back to draft — the publish/draft toggle, open until the first submission. */
export function useUnpublishAnalysisSheet(caseId: string) {
  return useApiMutation({
    mutationFn: () => unpublishAnalysisSheet(caseId),
    invalidate: [analysisSheetKeys.detail(caseId)],
    successToast: "Fiche d'analyse repassée en brouillon",
    errorToast: true,
  });
}
