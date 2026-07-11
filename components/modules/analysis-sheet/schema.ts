import { z } from "zod";

export type AnalysisSheetStatus = "DRAFT" | "PUBLISHED";
export type FaVariant = "LEASING_AVEC_CONTRAT" | "LEASING_SANS_CONTRAT" | "MC2_MUFFA";

/**
 * TA figures reused to prefill the sheet's header and the dossier's articulation
 * du financement (from the latest amortization schedule) — the TA is their only
 * source, nothing here is stored separately.
 */
export interface ScheduleSummary {
  loanAmount: number;
  durationMonths: number;
  startDate: string | null;
  endDate: string | null;
  totalEquipement: number;
  totalAssurance: number;
  totalTracking: number;
  totalImmatriculation: number;
  premierLoyerTtc: number | null;
  loyerMensuelHt: number | null;
  valeurResiduelle: number | null;
}

/**
 * A case's Fiche d'analyse. `content` is a placeholder free-text field standing
 * in for the real per-variant structure until it is supplied.
 */
export interface AnalysisSheet {
  id: string;
  creditCaseId: string;
  faVariant: FaVariant;
  status: AnalysisSheetStatus;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  taSummary: ScheduleSummary | null;
}

export const analysisSheetContentSchema = z.object({
  content: z.string().max(20000, "20 000 caractères maximum").optional(),
});

export type AnalysisSheetContentInput = z.infer<typeof analysisSheetContentSchema>;
