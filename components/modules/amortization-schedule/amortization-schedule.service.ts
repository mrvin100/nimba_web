import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { env } from "@/lib/env";
import type { OffsetsInput, PreviewResponse, ScheduleError, Trade, UploadResponse } from "./schema";

const basePath = (caseId: string) => `credit-cases/${caseId}/amortization-schedule`;

/**
 * Domain outcome of a definitive upload rejected by the backend (422): the file
 * parsed but carries content errors. Thrown here — the module's one entry point —
 * so the UI reacts to a typed outcome and never inspects HTTP statuses itself.
 */
export class ScheduleRejectedError extends Error {
  constructor(readonly errors: ScheduleError[]) {
    super("L'échéancier comporte des erreurs. Corrigez le fichier puis réessayez.");
    this.name = "ScheduleRejectedError";
  }
}

/** Parses and checks the CSV without persisting anything (NIMBA-19). */
export function previewSchedule(caseId: string, file: File): Promise<PreviewResponse> {
  const body = new FormData();
  body.append("file", file);
  return api.post(`${basePath(caseId)}/preview`, { body }).json<PreviewResponse>();
}

/** Persists the schedule definitively (NIMBA-20); throws [ScheduleRejectedError] on a content rejection. */
export async function uploadSchedule(caseId: string, file: File, offsets: OffsetsInput): Promise<UploadResponse> {
  const body = new FormData();
  body.append("file", file);
  try {
    return await api
      .post(basePath(caseId), {
        body,
        searchParams: {
          ordinaryOffsetMonths: offsets.ordinaryOffsetMonths,
          vrOffsetMonths: offsets.vrOffsetMonths,
          fixedDayOfMonth: offsets.fixedDayOfMonth,
        },
      })
      .json<UploadResponse>();
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      const problem = error.problem as unknown as { errors?: ScheduleError[] };
      throw new ScheduleRejectedError(problem.errors ?? []);
    }
    throw error;
  }
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

/** Same-origin URL of the Word (.docx) traités export (NIMBA-27). */
export function tradesDocxExportPath(caseId: string): string {
  return `${env.apiBasePath}/${basePath(caseId)}/trades/export/docx`;
}
