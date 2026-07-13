"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { QUERY_SCOPES } from "@/lib/query-keys";
import { createPv, finalizePv, getPv, updatePvDraft } from "./pv.service";
import type { CreatePvInput, UpdatePvDraftInput } from "./schema";

export const pvKeys = {
  all: [QUERY_SCOPES.pv] as const,
  detail: (caseId: string) => [QUERY_SCOPES.pv, caseId] as const,
};

/** The case's PV. A 404 (none generated yet) resolves to `null`, matching the FA/TA convention. */
export function usePv(caseId: string) {
  return useQuery({
    queryKey: pvKeys.detail(caseId),
    queryFn: () => getPv(caseId).catch(() => null),
  });
}

/** Opens the PV in draft; a rejection (dossier not APPROUVE, PV already exists) is toasted. */
export function useCreatePv(caseId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (input: CreatePvInput) => createPv(caseId, input),
    errorToast: true,
    onSuccess: (data) => queryClient.setQueryData(pvKeys.detail(caseId), data),
  });
}

/** Saves the draft's editable fields. */
export function useUpdatePvDraft(caseId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (input: UpdatePvDraftInput) => updatePvDraft(caseId, input),
    successToast: "PV enregistré",
    errorToast: true,
    onSuccess: (data) => queryClient.setQueryData(pvKeys.detail(caseId), data),
  });
}

/** Finalizes the PV, freezing its snapshot. */
export function useFinalizePv(caseId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: () => finalizePv(caseId),
    successToast: "PV finalisé",
    errorToast: true,
    onSuccess: (data) => queryClient.setQueryData(pvKeys.detail(caseId), data),
  });
}
