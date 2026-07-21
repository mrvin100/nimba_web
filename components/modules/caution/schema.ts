/** Every kind of caution/attestation the DCM can generate (mirrors the backend enum). Adding a future type (AVD...) is a backend + frontend metadata change, never a new hardcoded page. */
export const CAUTION_DOCUMENT_TYPES = ["SMS", "ACF"] as const;
export type CautionDocumentType = (typeof CAUTION_DOCUMENT_TYPES)[number];

export type CautionStatus = "DRAFT" | "FINAL";

export const CAUTION_STATUS_LABELS: Record<CautionStatus, string> = {
  DRAFT: "Brouillon",
  FINAL: "Finalisée",
};

export type CautionFieldType = "TEXT" | "DATE" | "AMOUNT";

/** One field of a document type's form — the frontend's dynamic form is built entirely from this list, never hardcoded per type. */
export interface CautionFieldDefinition {
  key: string;
  label: string;
  type: CautionFieldType;
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
}

export interface UpdateCautionInput {
  content: Record<string, string>;
}
