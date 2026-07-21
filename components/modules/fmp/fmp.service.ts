import { api } from "@/lib/api-client";
import { env } from "@/lib/env";
import type { CreateFmpInput, Fmp } from "./schema";

const basePath = (caseId: string) => `credit-cases/${caseId}/fmp`;

/** The case's FMP; throws a 404 ApiError while none has been generated yet. */
export function getFmp(caseId: string): Promise<Fmp> {
  return api.get(basePath(caseId)).json<Fmp>();
}

/** Generates the FMP as an extract of the case's finalized PV (409 if the PV isn't final yet, or one already exists). */
export function createFmp(caseId: string, input: CreateFmpInput): Promise<Fmp> {
  return api.post(basePath(caseId), { json: input }).json<Fmp>();
}

/**
 * Same-origin URL of the Word (.docx) export of the case's FMP. Used as an
 * anchor href so the browser downloads it directly with the session cookie.
 */
export function fmpDocxExportPath(caseId: string): string {
  return `${env.apiBasePath}/${basePath(caseId)}/export/docx`;
}
