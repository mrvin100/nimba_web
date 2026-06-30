import { z } from "zod";

/** Product types offered in this phase (mirrors the backend enum). */
export const PRODUCT_TYPES = ["LEASING"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export type CreditCaseStatus = "EN_ATTENTE_AMORTISSEMENT" | "TRADES_GENERES";

/** Create-case form schema; the inferred type is the request payload. */
export const createCaseSchema = z.object({
  clientName: z
    .string()
    .min(1, "Le nom du client est requis")
    .max(200, "200 caractères maximum"),
  productType: z.enum(PRODUCT_TYPES),
  currency: z.string().regex(/^[A-Z]{3}$/, "Code devise à 3 lettres majuscules (ex. GNF)"),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;

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
}

export type { PagedResponse } from "@/lib/pagination";
