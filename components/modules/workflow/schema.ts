import type { Department } from "@/components/modules/identity";

/** The dossier's cross-directorate lifecycle (mirrors the backend enum, design §12.1). */
export const WORKFLOW_STATUSES = [
  "BROUILLON",
  "EN_REVUE_DCM",
  "EN_REVUE_DRC",
  "CORRECTIONS_DRI",
  "A_COMPLETER",
  "EN_VERIFICATION_DCM",
  "PRET_POUR_COMITE",
  "APPROUVE",
  "EN_ARCHIVAGE",
  "REJETE",
  "EN_SIGNATURE",
  "SIGNE",
  "EN_COURS",
  "CLOTURE",
] as const;
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  BROUILLON: "Brouillon",
  EN_REVUE_DCM: "En revue DCM",
  EN_REVUE_DRC: "En analyse DRC",
  CORRECTIONS_DRI: "Corrections DRI",
  A_COMPLETER: "À compléter (DRI)",
  EN_VERIFICATION_DCM: "En vérification DCM",
  PRET_POUR_COMITE: "Prêt pour le comité",
  APPROUVE: "Approuvé",
  EN_ARCHIVAGE: "Archivage DCM",
  REJETE: "Rejeté",
  EN_SIGNATURE: "En signature",
  SIGNE: "Signé",
  EN_COURS: "En cours",
  CLOTURE: "Clôturé",
};

/** The direction whose turn it is to act at a given status (mirrors the backend's reviewDepartment mapping). */
export const WORKFLOW_REVIEW_DEPARTMENT: Partial<Record<WorkflowStatus, Department>> = {
  BROUILLON: "DRI",
  CORRECTIONS_DRI: "DRI",
  A_COMPLETER: "DRI",
  EN_REVUE_DCM: "DCM",
  EN_VERIFICATION_DCM: "DCM",
  EN_ARCHIVAGE: "DCM",
  EN_REVUE_DRC: "DRC",
  PRET_POUR_COMITE: "COMITE",
};

/**
 * Whether the dossier's constitution (client identity, conditions de banque,
 * guarantees, the dossier's own fields) is still safe for the DRI to edit —
 * true only while it's in a DRI-owned stage. Once it's under review, decided
 * or archived, editing it out from under the reviewers would silently
 * invalidate what they're looking at, so every constitution card gates its
 * edit actions on this in addition to the DRI department check.
 */
export function isDriEditable(status: WorkflowStatus | undefined): boolean {
  return status !== undefined && WORKFLOW_REVIEW_DEPARTMENT[status] === "DRI";
}

/** A move an actor can make on a dossier (mirrors the backend enum). */
export const WORKFLOW_ACTIONS = [
  "SUBMIT",
  "SUBMIT_CORRECTIONS",
  "APPROVE",
  "REQUEST_CHANGES",
  "REQUEST_COMPLETION",
  "SEND_TO_COMITE",
  "REJECT",
  "ARCHIVE",
] as const;
export type WorkflowActionType = (typeof WORKFLOW_ACTIONS)[number];

export const WORKFLOW_ACTION_LABELS: Record<WorkflowActionType, string> = {
  SUBMIT: "Soumettre à la revue",
  SUBMIT_CORRECTIONS: "Soumettre les corrections",
  APPROVE: "Approuver",
  REQUEST_CHANGES: "Demander des modifications",
  REQUEST_COMPLETION: "Renvoyer pour complément",
  SEND_TO_COMITE: "Envoyer au comité",
  REJECT: "Rejeter",
  ARCHIVE: "Archiver le dossier",
};

export interface WorkflowEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorDepartment: Department;
  action: WorkflowActionType;
  fromStatus: WorkflowStatus;
  toStatus: WorkflowStatus;
  comment: string | null;
  occurredAt: string;
}

/** The dossier's workflow state as the review screens render it (server-computed). */
export interface WorkflowState {
  creditCaseId: string;
  status: WorkflowStatus;
  /** Actions the current caller may take right now (empty when it is not their turn). */
  availableActions: WorkflowActionType[];
  comiteApprovals: number;
  comiteApprovalsRequired: number;
  /** A short explanation when the caller's expected action is blocked (e.g. FA not published). */
  hint: string | null;
  timeline: WorkflowEvent[];
}

/** One dossier awaiting the caller's review, for a direction's queue. */
export interface QueueItem {
  creditCaseId: string;
  caseNumber: string;
  clientName: string;
  status: WorkflowStatus;
  updatedAt: string;
}

export interface WorkflowActionInput {
  action: WorkflowActionType;
  comment?: string;
}

/** One row of the batch status lookup — drives a dossier list's status badges. */
export interface CaseWorkflowStatus {
  creditCaseId: string;
  status: WorkflowStatus;
}
