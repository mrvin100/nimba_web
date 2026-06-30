"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCreditCase, getCreditCase, listCreditCases } from "./credit-case-service";

/** Query keys for the credit-case domain (single source for cache invalidation). */
export const creditCaseKeys = {
  all: ["credit-cases"] as const,
  list: (page: number, size: number) => ["credit-cases", "list", page, size] as const,
  detail: (id: string) => ["credit-cases", "detail", id] as const,
};

/** Paginated list of credit cases (server state). */
export function useCreditCases(page: number, size = 20) {
  return useQuery({
    queryKey: creditCaseKeys.list(page, size),
    queryFn: () => listCreditCases(page, size),
  });
}

/** A single credit case by id (server state). */
export function useCreditCase(id: string) {
  return useQuery({
    queryKey: creditCaseKeys.detail(id),
    queryFn: () => getCreditCase(id),
  });
}

/** Creates a credit case and invalidates the list cache on success. */
export function useCreateCreditCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCreditCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditCaseKeys.all });
    },
  });
}
