/**
 * The dossier's editable fields, grouped for the edit form. Unlike a caution
 * (whose fields come from the backend metadata engine), a dossier's content is
 * free-form context reused by its companion documents, so the field list is
 * described here and rendered generically.
 *
 * Fields are organized into three sections by which document actually reads
 * them (verified against com.nimba.caution.internal.CautionDocxExportService):
 * "commun" mirrors the backend's CautionFieldRegistry.SHARED_FIELDS exactly
 * (every generated document reads these — SMS, ACF, AFC, PRO alike), the
 * other two are read only by their own document.
 *
 * Figures that a document already carries are deliberately absent: the Fiche's
 * sollicitations and its per-lot rentability are computed from the documents
 * attached to the dossier and from the fee schedule (see FeeScheduleFields),
 * never entered a second time here.
 */
export type DossierFieldType = "text" | "textarea" | "date" | "ouinon" | "civilite";

export interface DossierFieldDef {
  key: string;
  label: string;
  type: DossierFieldType;
  /** Required fields are marked with "*", validated by Zod, and block the save when empty. */
  required?: boolean;
  /** Zod error shown under the field when a required field is left empty. */
  requiredMessage?: string;
  /** Placeholder shown in the empty input to hint at the expected value/format. */
  placeholder?: string;
  /** One-line helper rendered under the field to make its purpose explicit. */
  description?: string;
}

export interface DossierFieldGroup {
  title: string;
  fields: DossierFieldDef[];
}

export type DossierSectionId = "commun" | "notification" | "fiche";

export interface DossierSection {
  id: DossierSectionId;
  title: string;
  description: string;
  groups: DossierFieldGroup[];
}

export const DOSSIER_SECTIONS: DossierSection[] = [
  {
    id: "commun",
    title: "Informations communes",
    description: "Reprises sur chaque document généré (caution, notification et fiche).",
    groups: [
      {
        title: "Contexte du marché",
        fields: [
          {
            key: "beneficiaire",
            label: "Bénéficiaire (Maître d'ouvrage)",
            type: "text",
            required: true,
            requiredMessage: "Indiquez le bénéficiaire (maître d'ouvrage).",
            placeholder: "Nom de l'organisme maître d'ouvrage",
          },
          {
            key: "referenceAppelOffres",
            label: "Référence de l'appel d'offres",
            type: "text",
            required: true,
            requiredMessage: "Indiquez la référence de l'appel d'offres.",
            placeholder: "Ex : AO N° 2026/DCM/001",
          },
          {
            key: "objetMarche",
            label: "Objet du marché (une ligne par lot)",
            type: "textarea",
            required: true,
            requiredMessage: "Décrivez l'objet du marché.",
            description:
              "Une seule ligne couvre tous les lots. Pour un intitulé différent par lot, saisissez une ligne par lot, dans le même ordre que le champ « Lots ».",
          },
          {
            key: "dateEmission",
            label: "Date d'émission",
            type: "date",
            required: true,
            requiredMessage: "Choisissez la date d'émission.",
            description: "Date figurant sur les documents générés.",
          },
          {
            key: "lots",
            label: "Lots (séparés par des virgules)",
            type: "text",
            placeholder: "Lot 1, Lot 2, Lot 3",
            description:
              "Laissez vide pour une demande mono-lot. Sinon séparez chaque lot par une virgule : ils alimentent le select « Lot » des documents et les colonnes de la fiche.",
          },
        ],
      },
      {
        title: "Signataires",
        fields: [
          { key: "signataire1Civilite", label: "Signataire 1 : civilité (Monsieur / Madame)", type: "text" },
          {
            key: "signataire1Nom",
            label: "Signataire 1 : nom complet",
            type: "text",
            required: true,
            requiredMessage: "Indiquez le nom du premier signataire.",
          },
          {
            key: "signataire1Titre",
            label: "Signataire 1 : titre",
            type: "text",
            required: true,
            requiredMessage: "Indiquez le titre du premier signataire.",
          },
          { key: "signataire2Civilite", label: "Signataire 2 : civilité (Monsieur / Madame)", type: "text" },
          {
            key: "signataire2Nom",
            label: "Signataire 2 : nom complet",
            type: "text",
            required: true,
            requiredMessage: "Indiquez le nom du second signataire.",
          },
          {
            key: "signataire2Titre",
            label: "Signataire 2 : titre",
            type: "text",
            required: true,
            requiredMessage: "Indiquez le titre du second signataire.",
          },
        ],
      },
    ],
  },
  {
    id: "notification",
    title: "Notification de caution",
    description: "Propres au courrier de notification envoyé au client.",
    groups: [
      {
        title: "Notification de caution",
        fields: [
          { key: "notifReference", label: "Référence du courrier", type: "text" },
          { key: "vReference", label: "V/Réf", type: "text" },
          {
            key: "destinataireCivilite",
            label: "Civilité du destinataire",
            type: "civilite",
            description: "Ouvre et referme le courrier (« Monsieur, » / « Madame, »).",
          },
          { key: "destinataireNom", label: "Destinataire", type: "text" },
          { key: "destinataireFonction", label: "Fonction du destinataire", type: "text" },
          { key: "demandeResume", label: "Résumé de la demande", type: "textarea" },
          { key: "articulationConcours", label: "Articulation des concours (une ligne par élément)", type: "textarea" },
          { key: "garantiesDetenues", label: "Garanties détenues", type: "text" },
          { key: "garantiesARecueillir", label: "Garanties à recueillir (une ligne par élément)", type: "textarea" },
        ],
      },
    ],
  },
  {
    id: "fiche",
    title: "Fiche d'approbation",
    description: "Propres à la fiche d'approbation interne.",
    groups: [
      {
        title: "Présentation client",
        fields: [
          { key: "mouvementConfie", label: "Mouvement confié", type: "text" },
          { key: "solde", label: "Solde", type: "text" },
          { key: "soldeDate", label: "Solde au (date)", type: "text" },
        ],
      },
      {
        title: "Documents à fournir",
        fields: [
          { key: "docDemande", label: "Demande", type: "ouinon" },
          { key: "docDao", label: "DAO", type: "ouinon" },
          { key: "docCouvertureFrais", label: "Couverture des frais", type: "ouinon" },
          { key: "docAutres", label: "Autres", type: "ouinon" },
        ],
      },
      {
        title: "Engagements dans nos livres",
        fields: [
          { key: "engTresorerieEncours", label: "Eng. par trésorerie : encours", type: "text" },
          { key: "engTresorerieSollicite", label: "Eng. par trésorerie : sollicité", type: "text" },
          { key: "engSoumissionEncours", label: "Soumission : encours", type: "text" },
          { key: "engSoumissionSollicite", label: "Soumission : sollicité", type: "text" },
        ],
      },
    ],
  },
];
