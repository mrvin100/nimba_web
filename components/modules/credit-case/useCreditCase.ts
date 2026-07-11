"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { queryKeys } from "@/lib/query-keys";
import { usePagedQuery } from "@/lib/use-paged-query";
import {
  archiveCreditCase,
  createCreditCase,
  deleteCreditCase,
  getCreditCase,
  listCaseTypes,
  listCreditCases,
  unarchiveCreditCase,
  updateClientIdentity,
  updateConditionsDeBanque,
  updateCreditCase,
} from "./credit-case.service";
import type { CaseFormInput, CaseListFilter, ClientIdentityInput, ConditionsDeBanqueInput } from "./schema";

/** Query keys for the credit-case domain (single source for cache invalidation). */
export const creditCaseKeys = queryKeys<CaseListFilter>("credit-cases");

/**
 * Every selectable dossier type (drives the create form's type picker). Backend
 * reference data that only changes with a deploy, so it is fetched once and kept
 * fresh for the session rather than refetched like case data.
 */
export function useCaseTypes() {
  return useQuery({
    queryKey: [...creditCaseKeys.all, "types"],
    queryFn: listCaseTypes,
    staleTime: Infinity,
  });
}

/** Paginated list of credit cases (server state); archived ones are hidden by default. */
export function useCreditCases(page: number, size = 20, filter: CaseListFilter = "active") {
  return usePagedQuery({
    keys: creditCaseKeys,
    page,
    size,
    filters: filter,
    fetch: (p, s) => listCreditCases(p, s, filter),
  });
}

/** A single credit case by id (server state). */
export function useCreditCase(id: string) {
  return useQuery({
    queryKey: creditCaseKeys.detail(id),
    queryFn: () => getCreditCase(id),
  });
}

/** Creates a credit case; refreshes the list and confirms with the case number. */
export function useCreateCreditCase() {
  return useApiMutation({
    mutationFn: createCreditCase,
    invalidate: [creditCaseKeys.all],
    successToast: (created) => `Dossier ${created.caseNumber} créé`,
  });
}

/** Updates a case; refreshes its detail and the list. */
export function useUpdateCreditCase(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (input: CaseFormInput) => updateCreditCase(id, input),
    invalidate: [creditCaseKeys.lists()],
    successToast: "Dossier mis à jour",
    onSuccess: (data) => {
      queryClient.setQueryData(creditCaseKeys.detail(id), data);
    },
  });
}

/** Replaces a case's client-identity details; refreshes its detail. */
export function useUpdateClientIdentity(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (input: ClientIdentityInput) => updateClientIdentity(id, input),
    successToast: "Identité du client enregistrée",
    onSuccess: (data) => {
      queryClient.setQueryData(creditCaseKeys.detail(id), data);
    },
  });
}

/** Replaces a case's conditions-de-banque details; refreshes its detail. */
export function useUpdateConditionsDeBanque(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (input: ConditionsDeBanqueInput) => updateConditionsDeBanque(id, input),
    successToast: "Conditions de banque enregistrées",
    onSuccess: (data) => {
      queryClient.setQueryData(creditCaseKeys.detail(id), data);
    },
  });
}

/**
 * Archives or restores a case (admin act). One mutation for the pair: the row
 * menu offers exactly one of the two depending on the case's current state.
 */
export function useArchiveCreditCase() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, archive }: { id: string; archive: boolean }) =>
      archive ? archiveCreditCase(id) : unarchiveCreditCase(id),
    invalidate: [creditCaseKeys.lists()],
    successToast: (data) => `Dossier ${data.caseNumber} ${data.archivedAt ? "archivé" : "restauré"}`,
    errorToast: true,
    onSuccess: (data) => {
      queryClient.setQueryData(creditCaseKeys.detail(data.id), data);
    },
  });
}

/** Definitively deletes a case with everything attached to it (admin act). */
export function useDeleteCreditCase() {
  return useApiMutation({
    mutationFn: (id: string) => deleteCreditCase(id),
    invalidate: [creditCaseKeys.all],
    successToast: "Dossier supprimé",
    errorToast: true,
  });
}
