import { api } from "@/lib/api-client";
import type { CaseFormInput, CaseListFilter, CaseType, CreditCase, CreditCaseSummary, PagedResponse } from "./schema";

/** Every selectable dossier type, driving the create form's type picker. */
export function listCaseTypes(): Promise<CaseType[]> {
  return api.get("credit-cases/types").json<CaseType[]>();
}

/** Lists credit cases, newest first (paginated); "all" skips the archived filter. */
export function listCreditCases(
  page = 0,
  size = 20,
  filter: CaseListFilter = "active",
): Promise<PagedResponse<CreditCaseSummary>> {
  const searchParams: Record<string, string | number | boolean> = { page, size };
  if (filter !== "all") searchParams.archived = filter === "archived";
  return api.get("credit-cases", { searchParams }).json<PagedResponse<CreditCaseSummary>>();
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

/** Archives a case out of the active list (admin act; nothing is destroyed). */
export function archiveCreditCase(id: string): Promise<CreditCase> {
  return api.post(`credit-cases/${id}/archive`).json<CreditCase>();
}

/** Puts an archived case back into the active list (admin act). */
export function unarchiveCreditCase(id: string): Promise<CreditCase> {
  return api.post(`credit-cases/${id}/unarchive`).json<CreditCase>();
}

/** Definitively deletes a case with its schedules and trades (admin act, irreversible). */
export async function deleteCreditCase(id: string): Promise<void> {
  await api.delete(`credit-cases/${id}`);
}
