import type { Department } from "@/components/modules/identity";
import type { FaSectionKey } from "@/components/modules/analysis-sheet";

/**
 * GitHub-style FA review (mirrors the backend review module): the active
 * reviewer batches per-section comments into a draft review — pending,
 * invisible to others — then submits a verdict that fires the workflow
 * transition. Threads are resolvable roots with replies.
 */

export const REVIEW_VERDICTS = ["APPROUVE", "CHANGEMENTS_DEMANDES", "AVIS_FAVORABLE", "OBSERVATIONS"] as const;
export type ReviewVerdict = (typeof REVIEW_VERDICTS)[number];

export const REVIEW_VERDICT_LABELS: Record<ReviewVerdict, string> = {
  APPROUVE: "Approuver",
  CHANGEMENTS_DEMANDES: "Demander des modifications",
  AVIS_FAVORABLE: "Avis favorable",
  OBSERVATIONS: "Émettre des observations",
};

/** The verdicts each reviewing direction may submit (mirrors the backend mapping). */
export const VERDICTS_BY_DEPARTMENT: Partial<Record<Department, ReviewVerdict[]>> = {
  DCM: ["APPROUVE", "CHANGEMENTS_DEMANDES"],
  DRC: ["AVIS_FAVORABLE", "OBSERVATIONS"],
};

export interface ReviewComment {
  id: string;
  sectionKey: FaSectionKey;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorDepartment: Department;
  body: string;
  /** True only for the caller's own not-yet-submitted comments. */
  pending: boolean;
  createdAt: string;
}

export interface ReviewThread {
  id: string;
  sectionKey: FaSectionKey;
  resolvedAt: string | null;
  resolvedBy: string | null;
  /** Root first, then replies in chronological order. */
  comments: ReviewComment[];
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  department: Department;
  verdict: ReviewVerdict;
  summary: string | null;
  submittedAt: string;
}

export interface DraftReview {
  id: string;
  pendingComments: number;
}

export interface ReviewOverview {
  threads: ReviewThread[];
  reviews: Review[];
  myDraft: DraftReview | null;
  unresolvedCount: number;
}
