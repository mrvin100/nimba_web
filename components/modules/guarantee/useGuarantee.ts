"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { QUERY_SCOPES } from "@/lib/query-keys";
import {
  createGuarantee,
  deleteGuarantee,
  deleteGuaranteeAttachment,
  listGuarantees,
  updateGuarantee,
  uploadGuaranteeAttachment,
} from "./guarantee.service";
import type { GuaranteeFormInput } from "./schema";

export const guaranteeKeys = {
  all: [QUERY_SCOPES.guarantee] as const,
  list: (caseId: string) => [QUERY_SCOPES.guarantee, "list", caseId] as const,
};

/** A case's guarantees (server state). */
export function useGuarantees(caseId: string) {
  return useQuery({
    queryKey: guaranteeKeys.list(caseId),
    queryFn: () => listGuarantees(caseId),
  });
}

export function useCreateGuarantee(caseId: string) {
  return useApiMutation({
    mutationFn: (input: GuaranteeFormInput) => createGuarantee(caseId, input),
    invalidate: [guaranteeKeys.list(caseId)],
    successToast: "Garantie ajoutée",
  });
}

export function useUpdateGuarantee(caseId: string) {
  return useApiMutation({
    mutationFn: ({ id, input }: { id: string; input: GuaranteeFormInput }) => updateGuarantee(caseId, id, input),
    invalidate: [guaranteeKeys.list(caseId)],
    successToast: "Garantie mise à jour",
  });
}

export function useDeleteGuarantee(caseId: string) {
  return useApiMutation({
    mutationFn: (id: string) => deleteGuarantee(caseId, id),
    invalidate: [guaranteeKeys.list(caseId)],
    successToast: "Garantie supprimée",
    errorToast: true,
  });
}

export function useUploadGuaranteeAttachment(caseId: string) {
  return useApiMutation({
    mutationFn: ({ guaranteeId, file }: { guaranteeId: string; file: File }) => uploadGuaranteeAttachment(caseId, guaranteeId, file),
    invalidate: [guaranteeKeys.list(caseId)],
    errorToast: true,
  });
}

export function useDeleteGuaranteeAttachment(caseId: string) {
  return useApiMutation({
    mutationFn: ({ guaranteeId, attachmentId }: { guaranteeId: string; attachmentId: string }) =>
      deleteGuaranteeAttachment(caseId, guaranteeId, attachmentId),
    invalidate: [guaranteeKeys.list(caseId)],
    errorToast: true,
  });
}
