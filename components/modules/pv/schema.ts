import { z } from "zod";
import type { ClientIdentity } from "@/components/modules/credit-case";
import type { GuaranteeKind } from "@/components/modules/guarantee";

export const PV_STATUSES = ["DRAFT", "FINAL"] as const;
export type PvStatus = (typeof PV_STATUSES)[number];

/** One row of the "débats du comité" table, typed by the DCM when drafting the PV. */
export interface PvDebat {
  preoccupation: string;
  reponse: string;
  recommandation: string;
}

export interface PvGuaranteeSnapshot {
  kind: GuaranteeKind;
  description: string;
}

/**
 * Dossier-level data frozen onto a PV at finalization. `conditionsDeBanque` is
 * declared separately from the live `ConditionsDeBanque` type — `fraisDivers`
 * stays the backend's raw JSON text here (a read-only, point-in-time archive,
 * never re-edited), rather than pulling in the live type's parsed shape.
 * `pointsForts`/`pointsFaibles` are read from the FA's own sections at
 * finalization — never typed on the PV itself.
 */
export interface PvSnapshot {
  identite: ClientIdentity;
  articulation: {
    loanAmount: number;
    durationMonths: number;
    totalEquipement: number;
    totalAssurance: number;
    totalTracking: number;
    totalImmatriculation: number;
    totalInteret: number;
    premierLoyerTtc: number | null;
    loyerMensuelHt: number | null;
    valeurResiduelle: number | null;
  };
  garanties: PvGuaranteeSnapshot[];
  conditionsDeBanque: {
    tauxInteretPct: number | null;
    fraisMiseEnPlacePct: number | null;
    comEngagementPct: number | null;
    fraisEtudesPct: number | null;
    valeurResiduellePct: number | null;
    fraisDivers: string | null;
  };
  pointsForts: string | null;
  pointsFaibles: string | null;
}

/** A dossier's PV (design §10.3) — DRAFT while the DCM edits it, then immutable once FINAL. */
export interface Pv {
  id: string;
  creditCaseId: string;
  status: PvStatus;
  seanceDate: string;
  rapporteur: string | null;
  president: string | null;
  debats: PvDebat[];
  createdAt: string;
  updatedAt: string;
  finalizedAt: string | null;
  snapshot: PvSnapshot | null;
}

export const createPvSchema = z.object({
  seanceDate: z.string().min(1, "La date de séance est requise"),
});

export type CreatePvInput = z.infer<typeof createPvSchema>;

export const updatePvDraftSchema = z.object({
  seanceDate: z.string().min(1, "La date de séance est requise"),
  rapporteur: z.string().max(200, "200 caractères maximum").optional(),
  president: z.string().max(200, "200 caractères maximum").optional(),
  debats: z.array(
    z.object({
      preoccupation: z.string().min(1, "Préoccupation requise").max(2000, "2000 caractères maximum"),
      reponse: z.string().min(1, "Réponse requise").max(2000, "2000 caractères maximum"),
      recommandation: z.string().min(1, "Recommandation requise").max(2000, "2000 caractères maximum"),
    }),
  ),
});

export type UpdatePvDraftInput = z.infer<typeof updatePvDraftSchema>;
