"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { queryKeys } from "@/lib/query-keys";
import { usePagedQuery } from "@/lib/use-paged-query";
import {
  createCaution,
  createDossier,
  deleteCaution,
  deleteDossier,
  documentHistory,
  dossierEvents,
  finalizeDossier,
  getDossier,
  getNextDossierSequence,
  getNextSequence,
  listCautionDocumentTypes,
  listDossiers,
  prorogeDossier,
  refinalizeDossier,
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
export const dossierKeys = queryKeys<{ clientId?: string }>("caution-dossier");

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
 * The next free number in documentType's own series — pre-fills the create
 * form's editable sequence field. Re-checked each time the form opens rather
 * than cached, since it changes with every document created in that series.
 */
export function useNextSequence(documentType: CautionDocumentType | undefined, enabled = true) {
  return useQuery({
    queryKey: [...cautionKeys.all, "next-sequence", documentType],
    queryFn: () => getNextSequence(documentType as CautionDocumentType),
    enabled: enabled && documentType !== undefined,
  });
}

/** The next free number in the dossier series — pre-fills the create dialog's editable sequence field. */
export function useNextDossierSequence(enabled = true) {
  return useQuery({
    queryKey: [...dossierKeys.all, "next-sequence"],
    queryFn: getNextDossierSequence,
    enabled,
  });
}

/** Opens a caution in draft; refreshes the list and any open dossier detail. */
export function useCreateCaution() {
  return useApiMutation({
    mutationFn: createCaution,
    invalidate: [cautionKeys.all, dossierKeys.all],
    successToast: (created) => `Document ${created.referenceNumber} ajouté`,
    errorToast: true,
  });
}

/** Replaces a document's field answers; refreshes its detail and any open dossier detail. */
export function useUpdateCaution(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (input: UpdateCautionInput) => updateCaution(id, input),
    invalidate: [cautionKeys.lists(), dossierKeys.all],
    successToast: "Document mis à jour",
    errorToast: true,
    onSuccess: (data) => {
      queryClient.setQueryData(cautionKeys.detail(id), data);
    },
  });
}

/** Deletes a document; refreshes the list and any open dossier detail. */
export function useDeleteCaution() {
  return useApiMutation({
    mutationFn: (id: string) => deleteCaution(id),
    invalidate: [cautionKeys.all, dossierKeys.all],
    successToast: "Document supprimé",
    errorToast: true,
  });
}

// ---- Dossiers ----------------------------------------------------------------

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

/** Every caution dossier of one client (the client 360 view). */
export function useClientDossiers(clientId: string) {
  const filters: { clientId?: string } = { clientId };
  return usePagedQuery({
    keys: dossierKeys,
    page: 0,
    size: 100,
    filters,
    fetch: (p, s) => listDossiers(p, s, clientId),
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

/** The query key of a dossier's lifecycle journal. */
const dossierEventsKey = (id: string) => [...dossierKeys.detail(id), "events"];

/** Refreshes a dossier's detail, its journal and the list after a lifecycle change. */
function refreshDossierAfter(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  queryClient.invalidateQueries({ queryKey: dossierKeys.detail(id) });
  queryClient.invalidateQueries({ queryKey: dossierEventsKey(id) });
}

/** Finalizes the request (freezes and locks the dossier). */
export function useFinalizeDossier(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: () => finalizeDossier(id),
    invalidate: [dossierKeys.lists()],
    successToast: "Demande finalisée",
    errorToast: true,
    onSuccess: () => refreshDossierAfter(queryClient, id),
  });
}

/** Reopens a finalized dossier for a correction (manager-only); the reason is journaled. */
export function useProrogeDossier(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (reason: string) => prorogeDossier(id, reason),
    invalidate: [dossierKeys.lists()],
    successToast: "Dossier prorogé",
    errorToast: true,
    onSuccess: () => refreshDossierAfter(queryClient, id),
  });
}

/** Re-locks a prorogated dossier once the correction is done. */
export function useRefinalizeDossier(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: () => refinalizeDossier(id),
    invalidate: [dossierKeys.lists()],
    successToast: "Dossier re-finalisé",
    errorToast: true,
    onSuccess: () => refreshDossierAfter(queryClient, id),
  });
}

/** Deletes a dossier and every document it holds (only while still a draft; admin-only). */
export function useDeleteDossier() {
  return useApiMutation({
    mutationFn: (id: string) => deleteDossier(id),
    invalidate: [dossierKeys.all],
    successToast: "Dossier supprimé",
    errorToast: true,
  });
}

/** A dossier's lifecycle journal. */
export function useDossierEvents(id: string, enabled = true) {
  return useQuery({ queryKey: dossierEventsKey(id), queryFn: () => dossierEvents(id), enabled });
}

/** A document's edit history. */
export function useDocumentHistory(id: string, enabled = true) {
  return useQuery({ queryKey: [...cautionKeys.detail(id), "history"], queryFn: () => documentHistory(id), enabled });
}
