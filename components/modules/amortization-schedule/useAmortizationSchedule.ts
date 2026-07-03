"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { creditCaseKeys } from "@/components/modules/credit-case";
import { generateTrades, listTrades, previewSchedule, uploadSchedule } from "./amortization-schedule.service";
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

/** Previews an uploaded CSV (no persistence); an unreadable file is toasted. */
export function usePreviewSchedule(caseId: string) {
  return useApiMutation({
    mutationFn: (file: File) => previewSchedule(caseId, file),
    errorToast: true,
  });
}

/** Persists a schedule definitively and reports the outcome. */
export function useUploadSchedule(caseId: string) {
  return useApiMutation({
    mutationFn: ({ file, offsets }: { file: File; offsets: OffsetsInput }) => uploadSchedule(caseId, file, offsets),
    successToast: (result) => `Échéancier importé (version ${result.versionNumber}, ${result.lineCount} lignes)`,
    errorToast: true,
  });
}

/** Generates trades, refreshes the trades list and the case (its status changes), and confirms. */
export function useGenerateTrades(caseId: string) {
  return useApiMutation({
    mutationFn: () => generateTrades(caseId),
    invalidate: [amortizationKeys.trades(caseId), creditCaseKeys.all],
    successToast: "Trades générés",
    errorToast: true,
  });
}
