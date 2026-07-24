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
export type FaSectionType =
  | "NARRATIVE"
  | "TABLE"
  | "KEY_VALUE"
  | "FLEX_TABLE"
  | "FINANCIAL"
  | "IMAGE"
  | "COMPUTED"
  | "BOUND";

/** The FA's top-level tabs (mirrors the backend enum). */
export type FaPilier = "COVER" | "PILIER_1" | "PILIER_2" | "PILIER_3" | "PILIER_4" | "CONCLUSION" | "ANNEXES";

/**
 * One section key of the full FA structure — both leasing variants, mirroring
 * the backend registry (docs/nimba-fa-document-spec.md §3–§4).
 */
export type FaSectionKey =
  | "COVER_INFOS_DEMANDE"
  | "COVER_INFOS_INTERNES"
  | "COVER_PROPOSITION"
  | "COVER_CONDITIONS_BANQUE"
  | "COVER_GARANTIES"
  | "PILIER1_INFOS_GENERALES"
  | "PILIER1_REGULARITE"
  | "PILIER1_SIGNATAIRES"
  | "PILIER1_POUVOIRS"
  | "PILIER1_DERNIERE_VISITE"
  | "PILIER1_MOUVEMENTS"
  | "PILIER1_RENTABILITE_COMPTE"
  | "PILIER1_ACTIONNARIAT"
  | "PILIER1_MORALITE"
  | "PILIER1_PERSONNES_CLES"
  | "PILIER1_ORGANIGRAMME"
  | "PILIER1_RELATIONS_BANCAIRES"
  | "PILIER1_LOGISTIQUE"
  | "PILIER1_CLIENTS"
  | "PILIER1_FOURNISSEURS"
  | "PILIER1_FONCTIONNEMENT_ACTIVITE"
  | "PILIER1_CONTRATS_REALISES"
  | "PILIER1_ENGAGEMENTS_NOS_LIVRES"
  | "PILIER1_ENGAGEMENTS_CONFRERES"
  | "PILIER1_CENTRALE_RISQUES"
  | "PILIER1_ENGAGEMENTS_APPARENTES"
  | "PILIER1_BILAN"
  | "PILIER1_COMPTE_RESULTAT"
  | "PILIER1_SYNTHESE"
  | "PILIER1_SYNTHESE_PAYEUR"
  | "PILIER2_CONTRAT"
  | "PILIER2_CONNAISSANCE_MO"
  | "PILIER2_PLANNING"
  | "PILIER2_MARCHE_SECTEUR"
  | "PILIER2_MARCHE_DEMANDE"
  | "PILIER2_MARCHE_OFFRE"
  | "PILIER2_POSITIONNEMENT"
  | "PILIER2_ENCAISSEMENTS"
  | "PILIER3_BESOINS"
  | "PILIER3_JUSTIFICATIFS"
  | "PILIER3_HYPOTHESE_H1"
  | "PILIER3_HYPOTHESE_H2"
  | "PILIER3_HYPOTHESE_CHARGES"
  | "PILIER3_CEP"
  | "PILIER3_DECAISSEMENT"
  | "PILIER3_RENTABILITE_BANQUE"
  | "PILIER3_SIMULATION_FINANCEMENT"
  | "PILIER4_RISQUES"
  | "PILIER4_SURETES"
  // BOUND onto the PV at finalization — see the pv module's PvSnapshot.
  | "CONCLUSION_POINTS_FORTS"
  | "CONCLUSION_POINTS_FAIBLES"
  | "CONCLUSION_OPPORTUNITES"
  | "CONCLUSION_ARTICULATION"
  | "CONCLUSION_GARANTIES"
  | "CONCLUSION_CONDITIONS_BANQUE"
  | "ANNEXE_PAYEUR_BILAN"
  | "ANNEXE_PAYEUR_COMPTE_RESULTAT"
  | "ANNEXE_LISTE_CLIENTS";

/** One uploaded figure of an IMAGE-type section (metadata; the binary has its own endpoint). */
export interface FaSectionImage {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  caption: string | null;
  uploadedAt: string;
}

/**
 * One section of a case's FA, resolved for display. `contentJson` and
 * `updatedAt` stay null for COMPUTED/BOUND sections (never persisted) and for
 * an editable section nothing has been saved to yet. `defaultContentJson`
 * carries the prefill for sections that start populated (e.g. §4.1's risk
 * matrix); `images` is filled for IMAGE sections only.
 */
export interface FaSection {
  key: FaSectionKey;
  pilier: FaPilier;
  type: FaSectionType;
  label: string;
  contentJson: string | null;
  updatedAt: string | null;
  defaultContentJson: string | null;
  images: FaSectionImage[];
}

export const faSectionContentSchema = z.object({
  contentJson: z.string().max(20000, "20 000 caractères maximum").optional(),
});

export type FaSectionContentInput = z.infer<typeof faSectionContentSchema>;

/**
 * The canonical content JSON shapes per section type (mirrored by the backend
 * export renderer — docs/nimba-fa-document-spec.md). All values are free text;
 * the analyst types amounts exactly as they must print.
 */
export interface FaTableContent {
  narrative?: string;
  rows: Record<string, string>[];
  commentaire?: string;
}

export interface FaFlexTableContent {
  narrative?: string;
  columns: string[];
  rows: string[][];
  commentaire?: string;
}

export interface FaFinancialLine {
  label: string;
  values: string[];
}

export interface FaFinancialContent {
  years: string[];
  lines: FaFinancialLine[];
  commentaire?: string;
}

export interface FaImageContent {
  narrative?: string;
  commentaire?: string;
}
