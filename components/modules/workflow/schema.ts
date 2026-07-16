import type { Department } from "@/components/modules/identity";

/** The dossier's cross-directorate lifecycle (mirrors the backend enum). */
export const WORKFLOW_STATUSES = [
  "BROUILLON",
  "EN_REVUE_DCM",
  "EN_REVUE_DRC",
  "PRET_POUR_COMITE",
  "APPROUVE",
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
  EN_REVUE_DRC: "En revue DRC",
  PRET_POUR_COMITE: "Prêt pour le comité",
  APPROUVE: "Approuvé",
  REJETE: "Rejeté",
  EN_SIGNATURE: "En signature",
  SIGNE: "Signé",
  EN_COURS: "En cours",
  CLOTURE: "Clôturé",
};

/** The direction whose turn it is to act at a given status (mirrors the backend's reviewDepartment mapping). */
export const WORKFLOW_REVIEW_DEPARTMENT: Partial<Record<WorkflowStatus, Department>> = {
  BROUILLON: "DRI",
  EN_REVUE_DCM: "DCM",
  EN_REVUE_DRC: "DRC",
  PRET_POUR_COMITE: "COMITE",
};

/** A move an actor can make on a dossier (mirrors the backend enum). */
export const WORKFLOW_ACTIONS = ["SUBMIT", "APPROVE", "REQUEST_CHANGES", "REQUEST_COMPLETION", "REJECT"] as const;
export type WorkflowActionType = (typeof WORKFLOW_ACTIONS)[number];

export const WORKFLOW_ACTION_LABELS: Record<WorkflowActionType, string> = {
  SUBMIT: "Soumettre à la revue",
  APPROVE: "Approuver",
  REQUEST_CHANGES: "Demander des modifications",
  REQUEST_COMPLETION: "Renvoyer pour complément",
  REJECT: "Rejeter",
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
