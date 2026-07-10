import { z } from "zod";

/** Product types offered in this phase (mirrors the backend enum). */
export const PRODUCT_TYPES = ["LEASING", "MC2_MUFFA"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

/** Only meaningful for LEASING — mirrors the backend enum. */
export const CONTRACT_TYPES = ["AVEC_CONTRAT", "SANS_CONTRAT"] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];

export type CreditCaseStatus = "EN_ATTENTE_AMORTISSEMENT" | "TRADES_GENERES";

/** Document kinds that constitute a dossier (mirrors the backend enum). */
export type DocumentKind = "TA" | "FA" | "PV" | "FMP" | "NOTIFICATION";
export type ScheduleFormat = "LEASING" | "CORE_BANKING";
export type FaVariant = "LEASING_AVEC_CONTRAT" | "LEASING_SANS_CONTRAT" | "MC2_MUFFA";

/**
 * One selectable dossier type, straight from the backend's CaseTypePolicy
 * registry (GET /credit-cases/types) — the create form never hardcodes this list.
 */
export interface CaseType {
  productType: ProductType;
  contractType: ContractType | null;
  label: string;
  requiredDocuments: DocumentKind[];
  scheduleFormat: ScheduleFormat;
  faVariant: FaVariant;
  generatesTraites: boolean;
}

/** Write-form schema (create and edit); the inferred type is the request payload. */
export const caseFormSchema = z
  .object({
    clientName: z
      .string()
      .min(1, "Le nom du client est requis")
      .max(200, "200 caractères maximum"),
    productType: z.enum(PRODUCT_TYPES),
    contractType: z.enum(CONTRACT_TYPES).optional(),
    currency: z.string().regex(/^[A-Z]{3}$/, "Code devise à 3 lettres majuscules (ex. GNF)"),
    // The client's account number at the bank — printed on the traités. Optional:
    // the backend treats a blank value as "not captured".
    accountNumber: z.string().max(50, "50 caractères maximum").optional(),
  })
  // Mirrors the backend's CaseTypePolicy rule: a contract type is required for
  // LEASING (each of its two sub-flavors has its own FA) and forbidden otherwise.
  .refine((values) => (values.productType === "LEASING" ? values.contractType !== undefined : true), {
    message: "Le type de contrat est requis pour un dossier Leasing",
    path: ["contractType"],
  })
  .refine((values) => (values.productType === "LEASING" ? true : values.contractType === undefined), {
    message: "Le type de contrat ne s'applique pas à ce type de dossier",
    path: ["contractType"],
  });

export type CaseFormInput = z.infer<typeof caseFormSchema>;

/** Row in the dashboard list. */
export interface CreditCaseSummary {
  id: string;
  caseNumber: string;
  clientName: string;
  productType: ProductType;
  contractType: ContractType | null;
  status: CreditCaseStatus;
  createdAt: string;
  /** When an administrator archived the case; null while it is active. */
  archivedAt: string | null;
}

/** List visibility filter: active (default view), archived, or everything. */
export type CaseListFilter = "active" | "archived" | "all";

/**
 * Descriptive client detail, captured once on the dossier and reused verbatim on
 * the Fiche d'analyse, the PV, and the FMP. Every field is optional supplementary
 * detail the DRI adds incrementally, never required to create the dossier.
 */
export interface ClientIdentity {
  formeJuridique: string | null;
  dateCreation: string | null;
  adressePhysique: string | null;
  activiteDeBase: string | null;
  codeNif: string | null;
  principalDirigeant: string | null;
  dateEntreeRelation: string | null;
  dateDerniereVisite: string | null;
  agence: string | null;
  gestionnaire: string | null;
  analyste: string | null;
  cotationPrecedente: string | null;
  cotationActuelle: string | null;
}

/** Full case (detail + create response). */
export interface CreditCase extends CreditCaseSummary {
  currency: string;
  accountNumber: string | null;
  clientIdentity: ClientIdentity;
}

/** Edit-form schema for the client-identity card; every field optional, blanks mean "not captured". */
export const clientIdentitySchema = z.object({
  formeJuridique: z.string().max(100, "100 caractères maximum").optional(),
  dateCreation: z.string().optional(),
  adressePhysique: z.string().max(300, "300 caractères maximum").optional(),
  activiteDeBase: z.string().max(300, "300 caractères maximum").optional(),
  codeNif: z.string().max(50, "50 caractères maximum").optional(),
  principalDirigeant: z.string().max(200, "200 caractères maximum").optional(),
  dateEntreeRelation: z.string().optional(),
  dateDerniereVisite: z.string().optional(),
  agence: z.string().max(100, "100 caractères maximum").optional(),
  gestionnaire: z.string().max(200, "200 caractères maximum").optional(),
  analyste: z.string().max(200, "200 caractères maximum").optional(),
  cotationPrecedente: z.string().max(20, "20 caractères maximum").optional(),
  cotationActuelle: z.string().max(20, "20 caractères maximum").optional(),
});

export type ClientIdentityInput = z.infer<typeof clientIdentitySchema>;

export type { PagedResponse } from "@/lib/pagination";
