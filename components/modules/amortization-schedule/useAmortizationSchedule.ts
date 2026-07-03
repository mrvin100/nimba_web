"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { QUERY_SCOPES } from "@/lib/query-keys";
import { creditCaseKeys } from "@/components/modules/credit-case";
import {
  generateTrades,
  getAmortizationOverview,
  getAmortizationTable,
  listTrades,
  previewSchedule,
  uploadSchedule,
} from "./amortization-schedule.service";
import type { OffsetsInput, OverviewRange, PaymentStatus } from "./schema";

/** Every amortization cache key, in one object on the module's central scope. */
export const amortizationKeys = {
  all: [QUERY_SCOPES.amortization] as const,
  trades: (caseId: string) => [QUERY_SCOPES.amortization, "trades", caseId] as const,
  overview: (caseId: string, range: OverviewRange) => [QUERY_SCOPES.amortization, "overview", caseId, range] as const,
  table: (caseId: string, page: number, size: number, status?: PaymentStatus) =>
    [QUERY_SCOPES.amortization, "table", caseId, page, size, status ?? "all"] as const,
};

/** The active generation's trades for a case (server state). */
export function useTrades(caseId: string) {
  return useQuery({
    queryKey: amortizationKeys.trades(caseId),
    queryFn: () => listTrades(caseId),
  });
}

/**
 * Server-computed overview of the latest schedule. A 404 (nothing imported yet)
 * resolves to `null` — the screen simply hides the section, it is not an error.
 */
export function useAmortizationOverview(caseId: string, range: OverviewRange = {}) {
  return useQuery({
    queryKey: amortizationKeys.overview(caseId, range),
    queryFn: () => getAmortizationOverview(caseId, range).catch(() => null),
  });
}

/** Detailed table page; `enabled=false` until the user expands the section (lazy). */
export function useAmortizationTable(
  caseId: string,
  params: { page: number; size: number; status?: PaymentStatus },
  enabled: boolean,
) {
  return useQuery({
    queryKey: amortizationKeys.table(caseId, params.page, params.size, params.status),
    queryFn: () => getAmortizationTable(caseId, params),
    enabled,
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
    invalidate: [amortizationKeys.all],
    successToast: (result) => `Échéancier importé (version ${result.versionNumber}, ${result.lineCount} lignes)`,
    errorToast: true,
  });
}

/** Generates trades, refreshes the trades list and the case (its status changes), and confirms. */
export function useGenerateTrades(caseId: string) {
  return useApiMutation({
    mutationFn: () => generateTrades(caseId),
    invalidate: [amortizationKeys.all, creditCaseKeys.all],
    successToast: "Trades générés",
    errorToast: true,
  });
}
