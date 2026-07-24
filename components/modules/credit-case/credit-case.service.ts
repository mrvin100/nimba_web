import { api } from "@/lib/api-client";
import type {
  CaseFormInput,
  CaseListFilter,
  CaseType,
  ConditionsDeBanqueInput,
  CreditCase,
  CreditCaseSummary,
  FraisDivers,
  PagedResponse,
} from "./schema";

/**
 * The wire shape of a case: identical to [CreditCase] except `fraisDivers` is
 * still the opaque JSON text the backend persists verbatim (mirroring the
 * analysis sheet's free-text content) — this module owns the only place that
 * parses it into the typed list the rest of the app uses.
 */
type CreditCaseWire = Omit<CreditCase, "conditionsDeBanque"> & {
  conditionsDeBanque: Omit<CreditCase["conditionsDeBanque"], "fraisDivers"> & { fraisDivers: string | null };
};

function toCreditCase(wire: CreditCaseWire): CreditCase {
  return {
    ...wire,
    conditionsDeBanque: {
      ...wire.conditionsDeBanque,
      fraisDivers: wire.conditionsDeBanque.fraisDivers ? (JSON.parse(wire.conditionsDeBanque.fraisDivers) as FraisDivers[]) : [],
    },
  };
}

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
  return api
    .get(`credit-cases/${id}`)
    .json<CreditCaseWire>()
    .then(toCreditCase);
}

/** Creates a credit case and returns it (with its generated case number). */
export function createCreditCase(input: CaseFormInput): Promise<CreditCase> {
  return api
    .post("credit-cases", { json: input })
    .json<CreditCaseWire>()
    .then(toCreditCase);
}

/** Updates a case's general information and returns it. */
export function updateCreditCase(id: string, input: CaseFormInput): Promise<CreditCase> {
  return api
    .put(`credit-cases/${id}`, { json: input })
    .json<CreditCaseWire>()
    .then(toCreditCase);
}

/** Replaces a case's conditions-de-banque details and returns the case. */
export function updateConditionsDeBanque(id: string, input: ConditionsDeBanqueInput): Promise<CreditCase> {
  const body = { ...input, fraisDivers: JSON.stringify(input.fraisDivers) };
  return api
    .put(`credit-cases/${id}/conditions-banque`, { json: body })
    .json<CreditCaseWire>()
    .then(toCreditCase);
}

/** Archives a case out of the active list (admin act; nothing is destroyed). */
export function archiveCreditCase(id: string): Promise<CreditCase> {
  return api
    .post(`credit-cases/${id}/archive`)
    .json<CreditCaseWire>()
    .then(toCreditCase);
}

/** Puts an archived case back into the active list (admin act). */
export function unarchiveCreditCase(id: string): Promise<CreditCase> {
  return api
    .post(`credit-cases/${id}/unarchive`)
    .json<CreditCaseWire>()
    .then(toCreditCase);
}

/** Definitively deletes a case with its schedules and trades (admin act, irreversible). */
export async function deleteCreditCase(id: string): Promise<void> {
  await api.delete(`credit-cases/${id}`);
}

/** A dossier document the Settings tab can wipe (mirrors the backend enum). */
export type ResettableDocument = "AMORTISSEMENT" | "FICHE_ANALYSE" | "GARANTIES" | "PV" | "FMP";

/** Wipes ONE document of a BROUILLON dossier (DRI manager / admin act, irreversible). */
export async function resetCaseDocument(caseId: string, document: ResettableDocument): Promise<void> {
  await api.post(`credit-cases/${caseId}/settings/reset/${document}`);
}
