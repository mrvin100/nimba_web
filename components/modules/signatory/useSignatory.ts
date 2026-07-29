"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { createSignatory, deleteSignatory, listSignatories, listSignatoryOptions, updateSignatory } from "./signatory.service";
import type { SignatoryInput } from "./schema";

export const signatoryKeys = {
  options: ["signatories", "options"] as const,
  list: ["signatories", "admin-list"] as const,
};

/** Every candidate the caller may pick — feeds a signatory combobox. */
export function useSignatoryOptions() {
  return useQuery({
    queryKey: signatoryKeys.options,
    queryFn: listSignatoryOptions,
  });
}

/** Every standalone signatory, unfiltered — the admin management view. */
export function useSignatories() {
  return useQuery({
    queryKey: signatoryKeys.list,
    queryFn: listSignatories,
  });
}

export function useCreateSignatory() {
  return useApiMutation({
    mutationFn: createSignatory,
    invalidate: [signatoryKeys.list, signatoryKeys.options],
    successToast: "Signataire créé",
    errorToast: true,
  });
}

export function useUpdateSignatory(id: string) {
  return useApiMutation({
    mutationFn: (input: SignatoryInput) => updateSignatory(id, input),
    invalidate: [signatoryKeys.list, signatoryKeys.options],
    successToast: "Signataire mis à jour",
    errorToast: true,
  });
}

export function useDeleteSignatory() {
  return useApiMutation({
    mutationFn: (id: string) => deleteSignatory(id),
    invalidate: [signatoryKeys.list, signatoryKeys.options],
    successToast: "Signataire supprimé",
    errorToast: true,
  });
}
