import { z } from "zod";

/** A bank client, independent of any credit case — backs the Caution module so documents can be grouped by matricule. */
export interface Client {
  id: string;
  /** The bank's internal client code; null until captured (optional for a leasing client). */
  matricule: string | null;
  raisonSociale: string;
  sigle: string | null;
  formeJuridique: string | null;
  dateCreation: string | null;
  adressePhysique: string | null;
  activiteDeBase: string | null;
  codeNif: string | null;
  rccm: string | null;
  accountNumber: string | null;
  principalDirigeant: string | null;
  dateEntreeRelation: string | null;
  dateDerniereVisite: string | null;
  agence: string | null;
  gestionnaire: string | null;
  analyste: string | null;
  cotationPrecedente: string | null;
  cotationActuelle: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Row of the client picker used when starting a new caution. */
export interface ClientSummary {
  id: string;
  matricule: string | null;
  raisonSociale: string;
  agence: string | null;
}

/** Create/update form payload — matricule is immutable once created, so the update form omits it. */
export interface ClientFormInput {
  raisonSociale: string;
  sigle?: string;
  formeJuridique?: string;
  dateCreation?: string;
  adressePhysique?: string;
  activiteDeBase?: string;
  codeNif?: string;
  rccm?: string;
  accountNumber?: string;
  principalDirigeant?: string;
  dateEntreeRelation?: string;
  dateDerniereVisite?: string;
  agence?: string;
  gestionnaire?: string;
  analyste?: string;
  cotationPrecedente?: string;
  cotationActuelle?: string;
}

export type CreateClientInput = ClientFormInput & { matricule?: string };

/**
 * Only the fields the Caution module's SMS/ACF renderers actually consume —
 * the rest of [Client]'s identity fields (forme juridique, dates, cotations...)
 * are left for a future client-detail screen to capture incrementally, the
 * same way a credit case's own identity is filled in over time.
 */
export const createClientSchema = z.object({
  // Optional: the bank's internal code is not always known when the dossier opens
  // (a leasing client may have none yet); the Caution module requires it to issue a
  // document, enforced at that point.
  matricule: z.string().max(50, "50 caractères maximum").optional(),
  raisonSociale: z.string().min(1, "Raison sociale requise").max(200, "200 caractères maximum"),
  sigle: z.string().max(100, "100 caractères maximum").optional(),
  adressePhysique: z.string().max(300, "300 caractères maximum").optional(),
  rccm: z.string().max(50, "50 caractères maximum").optional(),
  accountNumber: z.string().max(50, "50 caractères maximum").optional(),
  agence: z.string().max(100, "100 caractères maximum").optional(),
  gestionnaire: z.string().max(100, "100 caractères maximum").optional(),
  // Sent to the backend as a LocalDate: omit it when blank rather than sending "" (which can't be parsed).
  dateEntreeRelation: z
    .string()
    .optional()
    .transform((value) => value || undefined),
  principalDirigeant: z.string().max(200, "200 caractères maximum").optional(),
});

export type CreateClientFormInput = z.infer<typeof createClientSchema>;

// A blank date input must be sent as "absent", never "" (the backend's LocalDate
// parser rejects an empty string) — same treatment as the create form.
const optionalClientDate = z
  .string()
  .optional()
  .transform((value) => value || undefined);

/**
 * Full client edit schema — every descriptive field the backend accepts on
 * PUT /clients/{id} (matricule excluded, it is immutable). Backs the client-file
 * edit screen; the create dialog keeps its lighter subset.
 */
export const updateClientSchema = z.object({
  raisonSociale: z.string().min(1, "Raison sociale requise").max(200, "200 caractères maximum"),
  sigle: z.string().max(100, "100 caractères maximum").optional(),
  formeJuridique: z.string().max(100, "100 caractères maximum").optional(),
  dateCreation: optionalClientDate,
  adressePhysique: z.string().max(300, "300 caractères maximum").optional(),
  activiteDeBase: z.string().max(300, "300 caractères maximum").optional(),
  codeNif: z.string().max(50, "50 caractères maximum").optional(),
  rccm: z.string().max(50, "50 caractères maximum").optional(),
  accountNumber: z.string().max(50, "50 caractères maximum").optional(),
  principalDirigeant: z.string().max(200, "200 caractères maximum").optional(),
  dateEntreeRelation: optionalClientDate,
  dateDerniereVisite: optionalClientDate,
  agence: z.string().max(100, "100 caractères maximum").optional(),
  gestionnaire: z.string().max(200, "200 caractères maximum").optional(),
  analyste: z.string().max(200, "200 caractères maximum").optional(),
  cotationPrecedente: z.string().max(20, "20 caractères maximum").optional(),
  cotationActuelle: z.string().max(20, "20 caractères maximum").optional(),
});

export type UpdateClientFormInput = z.infer<typeof updateClientSchema>;
