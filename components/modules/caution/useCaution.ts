"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { queryKeys } from "@/lib/query-keys";
import { usePagedQuery } from "@/lib/use-paged-query";
import {
  createCaution,
  createDossier,
  deleteCaution,
  finalizeCaution,
  getCaution,
  getDossier,
  getReferenceSequenceStatus,
  listCautionDocumentTypes,
  listCautions,
  listDossiers,
  updateCaution,
  updateDossier,
} from "./caution.service";
import type { CautionDocumentType, CautionStatus, UpdateCautionInput, UpdateDossierInput } from "./schema";

interface CautionListFilters {
  clientId?: string;
  documentType?: CautionDocumentType;
  status?: CautionStatus;
}

export const cautionKeys = queryKeys<CautionListFilters>("caution");

/**
 * The generic document engine's metadata (shared + type-specific fields per
 * document type) — backend reference data that only changes with a deploy,
 * fetched once and kept fresh for the session.
 */
export function useCautionDocumentTypes() {
  return useQuery({
    queryKey: [...cautionKeys.all, "document-types"],
    queryFn: listCautionDocumentTypes,
    staleTime: Infinity,
  });
}

/**
 * Whether the create form should still offer a starting-sequence override —
 * only relevant before the very first caution ever created, so this is worth
 * re-checking each time the create dialog opens rather than caching forever.
 */
export function useReferenceSequenceStatus() {
  return useQuery({
    queryKey: [...cautionKeys.all, "reference-sequence-status"],
    queryFn: getReferenceSequenceStatus,
  });
}

/** Paginated list of cautions (server state). */
export function useCautions(page: number, size = 20, filters: CautionListFilters = {}) {
  return usePagedQuery({
    keys: cautionKeys,
    page,
    size,
    filters,
    fetch: (p, s, f) => listCautions(p, s, f),
  });
}

/** A single caution by id (server state). `enabled` lets a dialog defer the fetch until it actually opens. */
export function useCaution(id: string, enabled = true) {
  return useQuery({
    queryKey: cautionKeys.detail(id),
    queryFn: () => getCaution(id),
    enabled,
  });
}

/** Opens a caution in draft; refreshes the list and confirms with its reference number. */
export function useCreateCaution() {
  return useApiMutation({
    mutationFn: createCaution,
    invalidate: [cautionKeys.all],
    successToast: (created) => `Caution ${created.referenceNumber} créée`,
    errorToast: true,
  });
}

/** Replaces a draft's field answers; refreshes its detail. */
export function useUpdateCaution(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (input: UpdateCautionInput) => updateCaution(id, input),
    invalidate: [cautionKeys.lists()],
    successToast: "Caution mise à jour",
    errorToast: true,
    onSuccess: (data) => {
      queryClient.setQueryData(cautionKeys.detail(id), data);
    },
  });
}

/** Locks the caution; refreshes its detail and the list. */
export function useFinalizeCaution(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: () => finalizeCaution(id),
    invalidate: [cautionKeys.lists()],
    successToast: "Caution finalisée",
    errorToast: true,
    onSuccess: (data) => {
      queryClient.setQueryData(cautionKeys.detail(id), data);
    },
  });
}

/** Deletes a draft caution (409 if already finalized). */
export function useDeleteCaution() {
  return useApiMutation({
    mutationFn: (id: string) => deleteCaution(id),
    invalidate: [cautionKeys.all],
    successToast: "Caution supprimée",
    errorToast: true,
  });
}

// ---- Dossiers ----------------------------------------------------------------

export const dossierKeys = queryKeys<{ clientId?: string }>("caution-dossier");

/** Paginated list of dossiers (server state). */
export function useDossiers(page: number, size = 20) {
  return usePagedQuery({
    keys: dossierKeys,
    page,
    size,
    filters: {},
    fetch: (p, s) => listDossiers(p, s),
  });
}

/** A single dossier with its documents (server state). */
export function useDossier(id: string) {
  return useQuery({
    queryKey: dossierKeys.detail(id),
    queryFn: () => getDossier(id),
  });
}

/** Opens a dossier; refreshes the list and confirms with its reference number. */
export function useCreateDossier() {
  return useApiMutation({
    mutationFn: createDossier,
    invalidate: [dossierKeys.all],
    successToast: (created) => `Dossier ${created.referenceNumber} créé`,
    errorToast: true,
  });
}

/** Replaces a dossier's shared content; refreshes its detail and the list. */
export function useUpdateDossier(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (input: UpdateDossierInput) => updateDossier(id, input),
    invalidate: [dossierKeys.lists()],
    successToast: "Dossier mis à jour",
    errorToast: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dossierKeys.detail(id) });
    },
  });
}
