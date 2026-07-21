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
