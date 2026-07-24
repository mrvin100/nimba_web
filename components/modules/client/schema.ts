import { z } from "zod";

/** A bank client, independent of any credit case — backs the Caution module so documents can be grouped by matricule. */
export interface Client {
  id: string;
  matricule: string;
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
  matricule: string;
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

export type CreateClientInput = ClientFormInput & { matricule: string };

/**
 * Only the fields the Caution module's SMS/ACF renderers actually consume —
 * the rest of [Client]'s identity fields (forme juridique, dates, cotations...)
 * are left for a future client-detail screen to capture incrementally, the
 * same way a credit case's own identity is filled in over time.
 */
export const createClientSchema = z.object({
  matricule: z.string().min(1, "Matricule requis").max(50, "50 caractères maximum"),
  raisonSociale: z.string().min(1, "Raison sociale requise").max(200, "200 caractères maximum"),
  sigle: z.string().max(100, "100 caractères maximum").optional(),
  adressePhysique: z.string().max(300, "300 caractères maximum").optional(),
  rccm: z.string().max(50, "50 caractères maximum").optional(),
  accountNumber: z.string().max(50, "50 caractères maximum").optional(),
  agence: z.string().max(100, "100 caractères maximum").optional(),
  principalDirigeant: z.string().max(200, "200 caractères maximum").optional(),
});

export type CreateClientFormInput = z.infer<typeof createClientSchema>;
