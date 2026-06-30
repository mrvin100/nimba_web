import { api } from "@/lib/api-client";
import { env } from "@/lib/env";
import type { OffsetsInput, PreviewResponse, Trade, UploadResponse } from "./schema";

const basePath = (caseId: string) => `credit-cases/${caseId}/amortization-schedule`;

/** Parses and checks the CSV without persisting anything (NIMBA-19). */
export function previewSchedule(caseId: string, file: File): Promise<PreviewResponse> {
  const body = new FormData();
  body.append("file", file);
  return api.post(`${basePath(caseId)}/preview`, { body }).json<PreviewResponse>();
}

/** Persists the schedule definitively (NIMBA-20); rejects with 422 on any error. */
export function uploadSchedule(caseId: string, file: File, offsets: OffsetsInput): Promise<UploadResponse> {
  const body = new FormData();
  body.append("file", file);
  return api
    .post(basePath(caseId), {
      body,
      searchParams: {
        ordinaryOffsetMonths: offsets.ordinaryOffsetMonths,
        vrOffsetMonths: offsets.vrOffsetMonths,
        fixedDayOfMonth: offsets.fixedDayOfMonth,
      },
    })
    .json<UploadResponse>();
}

/** Generates the trades from the active schedule (NIMBA-23). */
export function generateTrades(caseId: string): Promise<Trade[]> {
  return api.post(`${basePath(caseId)}/trades`).json<Trade[]>();
}

/** The active generation's trades (NIMBA-26). */
export function listTrades(caseId: string): Promise<Trade[]> {
  return api.get(`${basePath(caseId)}/trades`).json<Trade[]>();
}

/**
 * Same-origin URL of the CSV export (NIMBA-27). Used as an anchor href so the
 * browser downloads it directly with the session cookie (no blob handling needed).
 */
export function tradesExportPath(caseId: string): string {
  return `${env.apiBasePath}/${basePath(caseId)}/trades/export`;
}
