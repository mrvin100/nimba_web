import { z } from "zod";

/** Held by the bank already, or still to be obtained (mirrors the backend enum). */
export const GUARANTEE_KINDS = ["DETENUE", "A_RECUEILLIR"] as const;
export type GuaranteeKind = (typeof GUARANTEE_KINDS)[number];

export const GUARANTEE_KIND_LABELS: Record<GuaranteeKind, string> = {
  DETENUE: "Détenue",
  A_RECUEILLIR: "À recueillir",
};

export interface GuaranteeAttachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

/** A dossier's guarantee, bound into the Fiche d'analyse, the PV and the FMP. */
export interface Guarantee {
  id: string;
  creditCaseId: string;
  kind: GuaranteeKind;
  description: string;
  createdAt: string;
  updatedAt: string;
  attachments: GuaranteeAttachment[];
}

export const guaranteeFormSchema = z.object({
  kind: z.enum(GUARANTEE_KINDS),
  description: z
    .string()
    .min(1, "La description est requise")
    .max(1000, "1000 caractères maximum"),
});

export type GuaranteeFormInput = z.infer<typeof guaranteeFormSchema>;
