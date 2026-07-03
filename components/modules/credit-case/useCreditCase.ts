"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { queryKeys } from "@/lib/query-keys";
import { usePagedQuery } from "@/lib/use-paged-query";
import { createCreditCase, getCreditCase, listCreditCases, updateCreditCase } from "./credit-case.service";
import type { CaseFormInput } from "./schema";

/** Query keys for the credit-case domain (single source for cache invalidation). */
export const creditCaseKeys = queryKeys("credit-cases");

/** Paginated list of credit cases (server state). */
export function useCreditCases(page: number, size = 20) {
  return usePagedQuery({
    keys: creditCaseKeys,
    page,
    size,
    fetch: (p, s) => listCreditCases(p, s),
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
