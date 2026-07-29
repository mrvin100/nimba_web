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
 */
export type DossierFieldType = "text" | "textarea" | "date" | "ouinon";

export interface DossierFieldDef {
  key: string;
  label: string;
  type: DossierFieldType;
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
          { key: "beneficiaire", label: "Bénéficiaire (Maître d'ouvrage)", type: "text" },
          { key: "referenceAppelOffres", label: "Référence de l'appel d'offres", type: "text" },
          { key: "objetMarche", label: "Objet du marché", type: "textarea" },
          { key: "dateEmission", label: "Date d'émission", type: "date" },
          { key: "lots", label: "Lots (séparés par des virgules)", type: "text" },
        ],
      },
      {
        title: "Signataires",
        fields: [
          { key: "signataire1Civilite", label: "Signataire 1 : civilité (Monsieur / Madame)", type: "text" },
          { key: "signataire1Nom", label: "Signataire 1 : nom complet", type: "text" },
          { key: "signataire1Titre", label: "Signataire 1 : titre", type: "text" },
          { key: "signataire2Civilite", label: "Signataire 2 : civilité (Monsieur / Madame)", type: "text" },
          { key: "signataire2Nom", label: "Signataire 2 : nom complet", type: "text" },
          { key: "signataire2Titre", label: "Signataire 2 : titre", type: "text" },
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
          { key: "destinataireNom", label: "Destinataire", type: "text" },
          { key: "destinataireFonction", label: "Fonction du destinataire", type: "text" },
          { key: "demandeResume", label: "Résumé de la demande", type: "textarea" },
          { key: "articulationConcours", label: "Articulation des concours (une ligne par élément)", type: "textarea" },
          { key: "garantiesDetenues", label: "Garanties détenues", type: "text" },
          { key: "garantiesARecueillir", label: "Garanties à recueillir (une ligne par élément)", type: "textarea" },
          { key: "conditionsBanque", label: "Conditions de banque (une ligne par condition)", type: "textarea" },
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
        title: "Sollicitations",
        fields: [
          { key: "sollicitationCaution", label: "Caution", type: "textarea" },
          { key: "sollicitationPromesse", label: "Promesse de facilité", type: "textarea" },
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
