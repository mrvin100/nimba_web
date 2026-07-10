import { api } from "@/lib/api-client";
import type { QueueItem, WorkflowActionInput, WorkflowState } from "./schema";

/** The dossier's current lifecycle state, its available actions and its timeline. */
export function getWorkflowState(caseId: string): Promise<WorkflowState> {
  return api.get(`credit-cases/${caseId}/workflow`).json<WorkflowState>();
}

/** Takes a workflow action on a dossier (submit, approve, request changes/completion, reject). */
export function postWorkflowAction(caseId: string, input: WorkflowActionInput): Promise<WorkflowState> {
  return api.post(`credit-cases/${caseId}/workflow/actions`, { json: input }).json<WorkflowState>();
}

/** Dossiers awaiting the caller's review, across every direction they belong to. */
export function getWorkflowQueue(): Promise<QueueItem[]> {
  return api.get("workflow/queue").json<QueueItem[]>();
}
