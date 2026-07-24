/** Every kind of caution/attestation the DCM can generate (mirrors the backend enum). Adding a future type (AVD...) is a backend + frontend metadata change, never a new hardcoded page. */
export const CAUTION_DOCUMENT_TYPES = ["SMS", "ACF"] as const;
export type CautionDocumentType = (typeof CAUTION_DOCUMENT_TYPES)[number];

export type CautionStatus = "DRAFT" | "FINAL";

export const CAUTION_STATUS_LABELS: Record<CautionStatus, string> = {
  DRAFT: "Brouillon",
  FINAL: "Finalisée",
};

export type CautionFieldType = "TEXT" | "DATE" | "AMOUNT" | "CURRENCY" | "CIVILITY";

export const CAUTION_CURRENCIES = ["GNF", "USD", "EUR"] as const;
export type CautionCurrency = (typeof CAUTION_CURRENCIES)[number];

/** Signatory civility options; the empty value means "omit from the document". */
export const CAUTION_CIVILITIES = ["Monsieur", "Madame"] as const;

/** One field of a document type's form — the frontend's dynamic form is built entirely from this list, never hardcoded per type. */
export interface CautionFieldDefinition {
  key: string;
  label: string;
  type: CautionFieldType;
  /** Optional fields (e.g. a signatory's civility) may be left blank and are not required to create or finalize. */
  optional: boolean;
}

/** The generic document engine's metadata, as returned by GET /cautions/document-types. */
export interface CautionDocumentTypeInfo {
  code: CautionDocumentType;
  label: string;
  sharedFields: CautionFieldDefinition[];
  specificFields: CautionFieldDefinition[];
}

export interface CautionClientSnapshot {
  matricule: string;
  raisonSociale: string;
  sigle: string | null;
  adressePhysique: string | null;
  rccm: string | null;
  accountNumber: string | null;
  agence: string | null;
}

export interface Caution {
  id: string;
  clientId: string;
  documentType: CautionDocumentType;
  referenceNumber: string;
  status: CautionStatus;
  content: Record<string, string>;
  clientSnapshot: CautionClientSnapshot | null;
  createdAt: string;
  updatedAt: string;
  finalizedAt: string | null;
}

/** Row of the Cautions data table. */
export interface CautionSummary {
  id: string;
  clientId: string;
  clientMatricule: string;
  clientRaisonSociale: string;
  documentType: CautionDocumentType;
  referenceNumber: string;
  status: CautionStatus;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCautionInput {
  clientId: string;
  documentType: CautionDocumentType;
  content: Record<string, string>;
  /** Only takes effect for the very first caution ever created — see the create dialog's KDoc. */
  startingReferenceSequence?: number;
}

export interface UpdateCautionInput {
  content: Record<string, string>;
}

/** Whether the create form should still offer a starting-sequence override (only before the very first caution ever created). */
export interface ReferenceSequenceStatus {
  initialized: boolean;
}
