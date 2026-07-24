import { api } from "@/lib/api-client";
import type { FaSectionKey } from "@/components/modules/analysis-sheet";
import type { Review, ReviewOverview, ReviewThread, ReviewVerdict } from "./schema";

const basePath = (caseId: string) => `credit-cases/${caseId}/review`;

/** Everything the review UI renders: visible threads, submitted reviews, the caller's draft. */
export function getReviewOverview(caseId: string): Promise<ReviewOverview> {
  return api.get(basePath(caseId)).json<ReviewOverview>();
}

/** Adds a comment (thread root or reply); pending when the caller is the active reviewer. */
export function addReviewComment(
  caseId: string,
  sectionKey: FaSectionKey,
  body: string,
  parentId?: string,
): Promise<ReviewThread> {
  return api.post(`${basePath(caseId)}/comments`, { json: { sectionKey, body, parentId } }).json<ReviewThread>();
}

/** Deletes one of the caller's own pending comments. */
export function deleteReviewComment(caseId: string, commentId: string): Promise<void> {
  return api.delete(`${basePath(caseId)}/comments/${commentId}`).then(() => undefined);
}

/** Resolves / unresolves a thread root. */
export function resolveReviewThread(caseId: string, commentId: string, resolved: boolean): Promise<ReviewThread> {
  return api.post(`${basePath(caseId)}/comments/${commentId}/${resolved ? "resolve" : "unresolve"}`).json<ReviewThread>();
}

/** Submits the caller's draft review — the verdict fires the workflow transition. */
export function submitReview(caseId: string, verdict: ReviewVerdict, summary?: string): Promise<Review> {
  return api.post(`${basePath(caseId)}/submit`, { json: { verdict, summary } }).json<Review>();
}
