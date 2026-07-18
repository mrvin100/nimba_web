"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { QUERY_SCOPES } from "@/lib/query-keys";
import { analysisSheetKeys } from "@/components/modules/analysis-sheet";
import { workflowKeys } from "@/components/modules/workflow";
import type { FaSectionKey } from "@/components/modules/analysis-sheet";
import { addReviewComment, deleteReviewComment, getReviewOverview, resolveReviewThread, submitReview } from "./review.service";
import type { ReviewVerdict } from "./schema";

export const reviewKeys = {
  all: [QUERY_SCOPES.review] as const,
  overview: (caseId: string) => [QUERY_SCOPES.review, caseId] as const,
};

/** The case's review overview — threads, submitted reviews, the caller's draft. */
export function useReviewOverview(caseId: string) {
  return useQuery({
    queryKey: reviewKeys.overview(caseId),
    queryFn: () => getReviewOverview(caseId),
  });
}

/** Adds a comment (root or reply); the overview is refetched to place it. */
export function useAddReviewComment(caseId: string) {
  return useApiMutation({
    mutationFn: ({ sectionKey, body, parentId }: { sectionKey: FaSectionKey; body: string; parentId?: string }) =>
      addReviewComment(caseId, sectionKey, body, parentId),
    invalidate: [reviewKeys.overview(caseId)],
    errorToast: true,
  });
}

/** Deletes one of the caller's own pending comments. */
export function useDeleteReviewComment(caseId: string) {
  return useApiMutation({
    mutationFn: ({ commentId }: { commentId: string }) => deleteReviewComment(caseId, commentId),
    invalidate: [reviewKeys.overview(caseId)],
    errorToast: true,
  });
}

/** Resolves / unresolves a thread while the DRI applies corrections. */
export function useResolveReviewThread(caseId: string) {
  return useApiMutation({
    mutationFn: ({ commentId, resolved }: { commentId: string; resolved: boolean }) =>
      resolveReviewThread(caseId, commentId, resolved),
    invalidate: [reviewKeys.overview(caseId)],
    errorToast: true,
  });
}

/**
 * Submits the draft review — the verdict fires the workflow transition, so the
 * workflow state and the FA (reopened on request-changes) are refetched too.
 */
export function useSubmitReview(caseId: string) {
  return useApiMutation({
    mutationFn: ({ verdict, summary }: { verdict: ReviewVerdict; summary?: string }) =>
      submitReview(caseId, verdict, summary),
    invalidate: [
      reviewKeys.overview(caseId),
      workflowKeys.state(caseId),
      analysisSheetKeys.detail(caseId),
      analysisSheetKeys.sections(caseId),
    ],
    successToast: "Revue soumise",
    errorToast: true,
  });
}
