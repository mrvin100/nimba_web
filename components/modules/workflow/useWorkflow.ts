"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { QUERY_SCOPES } from "@/lib/query-keys";
import { creditCaseKeys } from "@/components/modules/credit-case";
import { getWorkflowQueue, getWorkflowState, postWorkflowAction } from "./workflow.service";
import { WORKFLOW_STATUS_LABELS, type WorkflowActionInput } from "./schema";

export const workflowKeys = {
  all: [QUERY_SCOPES.workflow] as const,
  state: (caseId: string) => [QUERY_SCOPES.workflow, "state", caseId] as const,
  queue: () => [QUERY_SCOPES.workflow, "queue"] as const,
};

/** A dossier's workflow state (server state) — status, available actions, timeline. */
export function useWorkflowState(caseId: string) {
  return useQuery({
    queryKey: workflowKeys.state(caseId),
    queryFn: () => getWorkflowState(caseId),
  });
}

/** Dossiers awaiting the caller's review (a direction's queue). */
export function useWorkflowQueue() {
  return useQuery({
    queryKey: workflowKeys.queue(),
    queryFn: getWorkflowQueue,
  });
}

/**
 * Takes a workflow action. Refreshes the dossier's workflow state, every queue, and
 * the case itself (a rejection archives it; approvals change nothing on the case but
 * the list may sort/filter by status elsewhere).
 */
export function useWorkflowAction(caseId: string) {
  return useApiMutation({
    mutationFn: (input: WorkflowActionInput) => postWorkflowAction(caseId, input),
    invalidate: [workflowKeys.state(caseId), workflowKeys.queue(), creditCaseKeys.detail(caseId), creditCaseKeys.lists()],
    successToast: (state) => `Dossier mis à jour : ${WORKFLOW_STATUS_LABELS[state.status]}`,
    errorToast: true,
  });
}
