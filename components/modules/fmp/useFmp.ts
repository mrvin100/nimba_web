"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { QUERY_SCOPES } from "@/lib/query-keys";
import { createFmp, getFmp } from "./fmp.service";
import type { CreateFmpInput } from "./schema";

export const fmpKeys = {
  all: [QUERY_SCOPES.fmp] as const,
  detail: (caseId: string) => [QUERY_SCOPES.fmp, caseId] as const,
};

/** The case's FMP. A 404 (none generated yet) resolves to `null`, matching the PV/FA/TA convention. */
export function useFmp(caseId: string) {
  return useQuery({
    queryKey: fmpKeys.detail(caseId),
    queryFn: () => getFmp(caseId).catch(() => null),
  });
}

/** Generates the FMP; a rejection (PV not final, FMP already exists) is toasted. */
export function useCreateFmp(caseId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (input: CreateFmpInput) => createFmp(caseId, input),
    errorToast: true,
    onSuccess: (data) => queryClient.setQueryData(fmpKeys.detail(caseId), data),
  });
}
