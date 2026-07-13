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
  totalInteret: number;
  premierLoyerTtc: number | null;
  loyerMensuelHt: number | null;
  valeurResiduelle: number | null;
}

/** A case's Fiche d'analyse — its content lives in per-section rows, see [FaSection]. */
export interface AnalysisSheet {
  id: string;
  creditCaseId: string;
  faVariant: FaVariant;
  status: AnalysisSheetStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  taSummary: ScheduleSummary | null;
}

/** How a section is rendered and where its content lives (mirrors the backend enum). */
export type FaSectionType = "NARRATIVE" | "TABLE" | "COMPUTED" | "BOUND";

/** The FA's top-level tabs (mirrors the backend enum). */
export type FaPilier = "COVER" | "PILIER_1" | "PILIER_3" | "PILIER_4" | "CONCLUSION";

/**
 * One section key — the proof set built alongside the section framework itself
 * (mirrors the backend registry). The remaining ~12 sections are fast-follow.
 */
export type FaSectionKey =
  | "COVER_PROPOSITION"
  | "COVER_CONDITIONS_BANQUE"
  | "COVER_GARANTIES"
  | "PILIER1_PERSONNES_CLES"
  | "PILIER1_SYNTHESE"
  | "PILIER3_RENTABILITE_BANQUE"
  | "PILIER3_SIMULATION_FINANCEMENT"
  | "PILIER4_SURETES"
  | "CONCLUSION_ARTICULATION"
  | "CONCLUSION_GARANTIES"
  | "CONCLUSION_CONDITIONS_BANQUE"
  // BOUND onto the PV at finalization — see the pv module's PvSnapshot.
  | "CONCLUSION_POINTS_FORTS"
  | "CONCLUSION_POINTS_FAIBLES";

/**
 * One section of a case's FA, resolved for display. `contentJson` and
 * `updatedAt` stay null for COMPUTED/BOUND sections (never persisted) and for
 * an editable section nothing has been saved to yet.
 */
export interface FaSection {
  key: FaSectionKey;
  pilier: FaPilier;
  type: FaSectionType;
  label: string;
  contentJson: string | null;
  updatedAt: string | null;
}

/** One row of the "1.6 Personnes clés" proof TABLE section — the frontend's own shape for its opaque JSON. */
export interface PersonneCle {
  nom: string;
  fonction: string;
}

export const faSectionContentSchema = z.object({
  contentJson: z.string().max(20000, "20 000 caractères maximum").optional(),
});

export type FaSectionContentInput = z.infer<typeof faSectionContentSchema>;

export const personnesClesSchema = z.object({
  personnes: z.array(
    z.object({
      nom: z.string().min(1, "Nom requis").max(200, "200 caractères maximum"),
      fonction: z.string().min(1, "Fonction requise").max(200, "200 caractères maximum"),
    }),
  ),
});

export type PersonnesClesInput = z.infer<typeof personnesClesSchema>;
