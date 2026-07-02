"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { creditCaseKeys } from "@/components/modules/credit-case";
import { generateTrades, listTrades, previewSchedule, uploadSchedule } from "./amortization-service";
import type { OffsetsInput } from "./schema";

/** Query keys for the amortization-schedule domain. */
export const amortizationKeys = {
  all: ["amortization"] as const,
  trades: (caseId: string) => ["amortization", "trades", caseId] as const,
};

/** The active generation's trades for a case (server state). */
export function useTrades(caseId: string) {
  return useQuery({
    queryKey: amortizationKeys.trades(caseId),
    queryFn: () => listTrades(caseId),
  });
}

/** Previews an uploaded CSV (no persistence). */
export function usePreviewSchedule(caseId: string) {
  return useMutation({
    mutationFn: (file: File) => previewSchedule(caseId, file),
  });
}

/** Persists a schedule definitively. */
export function useUploadSchedule(caseId: string) {
  return useMutation({
    mutationFn: ({ file, offsets }: { file: File; offsets: OffsetsInput }) => uploadSchedule(caseId, file, offsets),
  });
}

/** Generates trades, then refreshes the trades list and the case (its status changes). */
export function useGenerateTrades(caseId: string) {
  return useApiMutation({
    mutationFn: () => generateTrades(caseId),
    invalidate: [amortizationKeys.trades(caseId), creditCaseKeys.all],
  });
}
