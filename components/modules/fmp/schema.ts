import { z } from "zod";
import type { ClientIdentity } from "@/components/modules/credit-case";
import type { PvGuaranteeSnapshot } from "@/components/modules/pv";
import type { ScheduleSummary } from "@/components/modules/analysis-sheet";

/**
 * A dossier's FMP (design §10.4) — a pure extract of its finalized PV, plus
 * the two fields captured at generation. There is no draft lifecycle: once
 * created, an FMP never changes. `conditionsDeBanque` keeps `fraisDivers` as
 * the backend's raw JSON text, same reasoning as the PV snapshot's — a
 * read-only, point-in-time archive, not an edited form.
 */
export interface Fmp {
  id: string;
  creditCaseId: string;
  numeroPret: string;
  garantieRef: string | null;
  createdAt: string;
  caseNumber: string;
  clientName: string;
  accountNumber: string | null;
  gfcEnCharge: string;
  identite: ClientIdentity;
  articulation: ScheduleSummary;
  garanties: PvGuaranteeSnapshot[];
  conditionsDeBanque: {
    tauxInteretPct: number | null;
    fraisMiseEnPlacePct: number | null;
    comEngagementPct: number | null;
    fraisEtudesPct: number | null;
    valeurResiduellePct: number | null;
    fraisDivers: string | null;
  };
}

export const createFmpSchema = z.object({
  numeroPret: z.string().min(1, "Le numéro de prêt est requis").max(50, "50 caractères maximum"),
  garantieRef: z.string().max(100, "100 caractères maximum").optional(),
});

export type CreateFmpInput = z.infer<typeof createFmpSchema>;
