import { api } from "@/lib/api-client";
import type { CaseFormInput, CreditCase, CreditCaseSummary, PagedResponse } from "./schema";

/** Lists credit cases, newest first (paginated). */
export function listCreditCases(page = 0, size = 20): Promise<PagedResponse<CreditCaseSummary>> {
  return api.get("credit-cases", { searchParams: { page, size } }).json<PagedResponse<CreditCaseSummary>>();
}

/** Resolves a single case by id. */
export function getCreditCase(id: string): Promise<CreditCase> {
  return api.get(`credit-cases/${id}`).json<CreditCase>();
}

/** Creates a credit case and returns it (with its generated case number). */
export function createCreditCase(input: CaseFormInput): Promise<CreditCase> {
  return api.post("credit-cases", { json: input }).json<CreditCase>();
}

/** Updates a case's general information and returns it. */
export function updateCreditCase(id: string, input: CaseFormInput): Promise<CreditCase> {
  return api.put(`credit-cases/${id}`, { json: input }).json<CreditCase>();
}
