import { z } from "zod";

/** Product types offered in this phase (mirrors the backend enum). */
export const PRODUCT_TYPES = ["LEASING"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export type CreditCaseStatus = "EN_ATTENTE_AMORTISSEMENT" | "TRADES_GENERES";

/** Write-form schema (create and edit); the inferred type is the request payload. */
export const caseFormSchema = z.object({
  clientName: z
    .string()
    .min(1, "Le nom du client est requis")
    .max(200, "200 caractères maximum"),
  productType: z.enum(PRODUCT_TYPES),
  currency: z.string().regex(/^[A-Z]{3}$/, "Code devise à 3 lettres majuscules (ex. GNF)"),
  // The client's account number at the bank — printed on the traités. Optional:
  // the backend treats a blank value as "not captured".
  accountNumber: z.string().max(50, "50 caractères maximum").optional(),
});

export type CaseFormInput = z.infer<typeof caseFormSchema>;

/** Row in the dashboard list. */
export interface CreditCaseSummary {
  id: string;
  caseNumber: string;
  clientName: string;
  productType: ProductType;
  status: CreditCaseStatus;
  createdAt: string;
}

/** Full case (detail + create response). */
export interface CreditCase extends CreditCaseSummary {
  currency: string;
  accountNumber: string | null;
}

export type { PagedResponse } from "@/lib/pagination";
