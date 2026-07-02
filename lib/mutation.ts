"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";

/**
 * Standard mutation wrapper: one place for cache invalidation and user feedback
 * so every write in the app behaves identically. Forms that surface errors
 * inline (form.setError("root")) simply omit `errorToast`.
 */
export function useApiMutation<TData, TVariables = void>(options: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Query keys invalidated after a successful write. */
  invalidate?: QueryKey[];
  /** Success toast; a function receives the mutation result. */
  successToast?: string | ((data: TData) => string);
  /** Error toast (default off — forms usually surface errors inline). */
  errorToast?: boolean;
  onSuccess?: (data: TData, variables: TVariables) => void;
}) {
  const queryClient = useQueryClient();
  const { mutationFn, invalidate, successToast, errorToast, onSuccess } = options;
  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      invalidate?.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      if (successToast) {
        toast.success(typeof successToast === "function" ? successToast(data) : successToast);
      }
      onSuccess?.(data, variables);
    },
    onError: (error) => {
      if (errorToast) toast.error(getErrorMessage(error));
    },
  });
}
