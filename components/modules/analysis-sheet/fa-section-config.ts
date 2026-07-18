import type { FaSectionKey } from "./schema";

/**
 * Per-key editor configuration for the FA's typed sections — the frontend
 * mirror of the backend export's column/field definitions (they must agree on
 * the content JSON field names; docs/nimba-fa-document-spec.md). A TABLE or
 * KEY_VALUE key absent from these maps has no dedicated editor yet.
 */

export interface TableColumn {
  field: string;
  header: string;
}

export interface TableConfig {
  columns: TableColumn[];
  /** Intro paragraph above the table (e.g. 1.4.1's rentabilité preamble). */
  hasNarrative?: boolean;
  /** Fixed first-column values to seed an empty table with (e.g. the CEP's éléments). */
  seedRows?: string[];
}

export const TABLE_CONFIGS: Partial<Record<FaSectionKey, TableConfig>> = {
  PILIER1_SIGNATAIRES: {
    columns: [
      { field: "nom", header: "Noms et prénoms" },
      { field: "piece", header: "Référence de la pièce d'identité" },
      { field: "validite", header: "Validité" },
    ],
  },
  PILIER1_MOUVEMENTS: {
    columns: [
      { field: "annee", header: "Année" },
      { field: "montant", header: "Total mouvement confié" },
    ],
  },
  PILIER1_RENTABILITE_COMPTE: {
    hasNarrative: true,
    columns: [
      { field: "nature", header: "Nature" },
      { field: "montant", header: "Montant" },
    ],
  },
  PILIER1_ACTIONNARIAT: {
    columns: [
      { field: "nom", header: "Nom ou raison sociale" },
      { field: "capital", header: "Capital détenu" },
      { field: "actions", header: "Nombre d'actions" },
      { field: "pourcentage", header: "Pourcentage" },
      { field: "nationalite", header: "Nationalité" },
      { field: "observations", header: "Observations" },
    ],
  },
  PILIER1_MORALITE: {
    columns: [
      { field: "nom", header: "Nom et prénom" },
      { field: "casier", header: "Casier judiciaire" },
      { field: "interditBancaire", header: "Interdit bancaire" },
      { field: "listeNoire", header: "Liste noire" },
      { field: "respectEngagements", header: "Respect des engagements" },
      { field: "reputation", header: "Réputation sociale" },
    ],
  },
  PILIER1_PERSONNES_CLES: {
    columns: [
      { field: "nom", header: "Noms et prénoms" },
      { field: "fonction", header: "Fonctions occupées" },
      { field: "experience", header: "Expérience" },
      { field: "categorie", header: "Catégorie" },
    ],
  },
  PILIER1_RELATIONS_BANCAIRES: {
    columns: [
      { field: "banque", header: "Banque" },
      { field: "mouvementExercice", header: "Mouvement exercice N-1" },
      { field: "mouvementsEnCours", header: "Mouvements en cours" },
    ],
  },
  PILIER1_LOGISTIQUE: {
    columns: [
      { field: "designation", header: "Désignation" },
      { field: "quantite", header: "Quantité" },
      { field: "observation", header: "Observation" },
    ],
  },
  PILIER1_CLIENTS: {
    columns: [
      { field: "designation", header: "Désignation" },
      { field: "localisation", header: "Localisation" },
      { field: "chiffreAffaires", header: "CA sur exos N-1" },
    ],
  },
  PILIER1_FOURNISSEURS: {
    columns: [
      { field: "designation", header: "Désignation" },
      { field: "contacts", header: "Contacts" },
    ],
  },
  PILIER1_CONTRATS_REALISES: {
    hasNarrative: true,
    columns: [
      { field: "nature", header: "Nature des travaux" },
      { field: "maitreOuvrage", header: "Maître d'ouvrage" },
      { field: "adresseLivraison", header: "Adresse de livraison" },
      { field: "dateLivraison", header: "Date de livraison" },
    ],
  },
  PILIER1_ENGAGEMENTS_NOS_LIVRES: {
    columns: [
      { field: "nature", header: "Nature du concours" },
      { field: "autorisation", header: "Autorisation" },
      { field: "taux", header: "Taux" },
      { field: "encours", header: "Encours" },
      { field: "echeance", header: "Échéance" },
    ],
    seedRows: ["TOTAL TRESO", "TOTAL SIGN", "Total GENERAL"],
  },
  PILIER1_SYNTHESE_PAYEUR: {
    columns: [
      { field: "indicateur", header: "Indicateur" },
      { field: "commentaire", header: "Commentaire" },
    ],
    seedRows: [
      "RAISON SOCIALE",
      "ADRESSE",
      "NUMERO DE COMPTE",
      "STRUCTURE DE L'ACTIONNARIAT",
      "RELATION BANCAIRE",
      "LOGISTIQUE",
      "CLIENTS",
      "FOURNISSEURS",
      "ENGAGEMENTS",
      "ETATS FINANCIERS",
    ],
  },
  PILIER2_ENCAISSEMENTS: {
    columns: [
      { field: "periode", header: "Période" },
      { field: "numeroCheque", header: "N° chèque" },
      { field: "banque", header: "Banque" },
      { field: "montant", header: "Montant" },
      { field: "observation", header: "Observation" },
    ],
  },
  PILIER3_CEP: {
    hasNarrative: true,
    columns: [
      { field: "element", header: "Éléments" },
      { field: "unMois", header: "1 mois" },
      { field: "douzeMois", header: "12 mois" },
    ],
    seedRows: [
      "Chiffre d'affaires",
      "Frais de carburant",
      "Loyer",
      "Entretiens et réparation",
      "Autres frais",
      "VALEUR AJOUTEE",
      "Charge du personnel",
      "EBE",
      "Dotation aux amortissements et aux provisions",
      "RESULTAT D'EXPLOITATION",
      "Frais financiers",
      "RESULTAT FINANCIER",
      "RAO",
      "Impôt sur le résultat",
      "RESULTAT NET",
      "CAF",
    ],
  },
  PILIER4_RISQUES: {
    columns: [
      { field: "nature", header: "Nature du risque" },
      { field: "facteurs", header: "Facteurs de risque" },
      { field: "mesures", header: "Mesures de mitigation" },
    ],
  },
};

export interface KeyValueField {
  field: string;
  label: string;
}

export const KEY_VALUE_CONFIGS: Partial<Record<FaSectionKey, KeyValueField[]>> = {
  COVER_INFOS_DEMANDE: [
    { field: "reference", label: "Référence de la demande" },
    { field: "dateReception", label: "Date de réception demande" },
    { field: "montantSollicite", label: "Montant financement sollicité" },
    { field: "equipement", label: "Équipement" },
    { field: "concessionnaire", label: "Concessionnaire" },
    { field: "premierLoyerTtc", label: "1er loyer TTC" },
    { field: "risqueGlobal", label: "Risque global" },
    { field: "comiteCompetent", label: "Comité de crédit compétent" },
    { field: "natureDemande", label: "Nature de la demande" },
  ],
  COVER_INFOS_INTERNES: [
    { field: "derniersEtatsFinanciers", label: "Derniers états financiers reçus" },
    { field: "fraisEtudeDossier", label: "Frais d'étude dossier" },
  ],
  PILIER2_CONTRAT: [
    { field: "dateEnregistrement", label: "Date d'enregistrement" },
    { field: "natureTravaux", label: "Nature des travaux" },
    { field: "dateSignature", label: "Date de signature" },
    { field: "maitreOuvrage", label: "Maître d'ouvrage" },
    { field: "delaisExecution", label: "Délais d'exécution" },
    { field: "modalitePaiement", label: "Modalité de paiement" },
    { field: "delaiPaiement", label: "Délai de paiement" },
    { field: "domiciliation", label: "Domiciliation" },
    { field: "conditionsSuspensives", label: "Conditions suspensives du contrat" },
    { field: "conditionPaiement", label: "Condition de paiement" },
  ],
};

/** SYSCOHADA rubrique seeds for the financial sections (from the real documents). */
export const FINANCIAL_SEEDS: Partial<Record<FaSectionKey, string[]>> = {
  PILIER1_BILAN: BILAN_LINES(),
  PILIER1_COMPTE_RESULTAT: COMPTE_RESULTAT_LINES(),
  ANNEXE_PAYEUR_BILAN: BILAN_LINES(),
  ANNEXE_PAYEUR_COMPTE_RESULTAT: COMPTE_RESULTAT_LINES(),
};

function BILAN_LINES(): string[] {
  return [
    "ACTIF",
    "Immobilisations corporelles",
    "Terrains",
    "Bâtiments",
    "Installations et agencements",
    "Matériel",
    "Matériel de transport",
    "Total Actif immobilisé",
    "Stocks et encours",
    "Clients",
    "Autres créances",
    "Total Actif circulant",
    "Banques, chèques postaux, caisse",
    "Total Trésorerie-Actif",
    "TOTAL GENERAL ACTIF",
    "PASSIF",
    "Capital",
    "Report à nouveau",
    "Résultat net de l'exercice",
    "Total Capitaux propres",
    "Emprunts",
    "Total Dettes financières",
    "Total Ressources stables",
    "Fournisseurs d'exploitation",
    "Dettes fiscales et sociales",
    "Autres dettes",
    "Total Passif circulant",
    "TOTAL GENERAL PASSIF",
  ];
}

function COMPTE_RESULTAT_LINES(): string[] {
  return [
    "Chiffre d'affaires (CA)",
    "Ventes de marchandises",
    "Achats de marchandises",
    "Variation de stocks",
    "Marge brute",
    "Travaux services vendus",
    "Marge brute sur matières",
    "Autres achats",
    "Transports",
    "Services extérieurs",
    "Impôts et taxes",
    "Valeur ajoutée",
    "Charges du personnel",
    "EBE",
    "Dotations aux amortissements et aux provisions",
    "Total produits d'exploitation",
    "Total charges d'exploitation",
    "Résultat d'exploitation",
    "Résultat des activités ordinaires",
    "Impôt sur le résultat",
    "Résultat net",
    "CAFG",
  ];
}
