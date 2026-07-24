"use client";

import { useState } from "react";
import { Check, MessageSquarePlus, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { DEPARTMENT_LABELS, useSession } from "@/components/modules/identity";
import { ActorAvatar } from "@/components/shared/actor-avatar";
import type { FaSectionKey } from "@/components/modules/analysis-sheet";
import { useAddReviewComment, useDeleteReviewComment, useResolveReviewThread } from "./useReview";
import type { ReviewComment, ReviewThread } from "./schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function CommentBubble({
  caseId,
  comment,
  canDeletePending,
}: Readonly<{ caseId: string; comment: ReviewComment; canDeletePending: boolean }>) {
  const remove = useDeleteReviewComment(caseId);
  return (
    <div className={cn("flex gap-2 rounded-md border p-2 text-sm", comment.pending && "border-dashed bg-muted/40")}>
      <ActorAvatar name={comment.authorName} department={comment.authorDepartment} size="sm" className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{comment.authorName}</span> ·{" "}
            {DEPARTMENT_LABELS[comment.authorDepartment]} · {formatDateTime(comment.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            {comment.pending && <Badge variant="outline">En attente</Badge>}
            {comment.pending && canDeletePending && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Supprimer ce commentaire en attente"
                onClick={() => remove.mutate({ commentId: comment.id })}
              >
                <Trash2 />
              </Button>
            )}
          </span>
        </div>
        <p className="whitespace-pre-wrap">{comment.body}</p>
      </div>
    </div>
  );
}

function Thread({ caseId, thread }: Readonly<{ caseId: string; thread: ReviewThread }>) {
  const session = useSession();
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);
  const addComment = useAddReviewComment(caseId);
  const resolve = useResolveReviewThread(caseId);

  const root = thread.comments[0];
  const resolved = thread.resolvedAt !== null;
  const canResolve = session.hasDepartment("DRI") || session.user?.userId === root?.authorId;
  const isPendingThread = root?.pending ?? false;

  function sendReply() {
    addComment.mutate(
      { sectionKey: thread.sectionKey, body: reply.trim(), parentId: thread.id },
      {
        onSuccess: () => {
          setReply("");
          setReplying(false);
        },
      },
    );
  }

  return (
    <div className={cn("space-y-2 rounded-lg border p-3", resolved && "opacity-70")}>
      <div className="flex items-center justify-between gap-2">
        <Badge variant={resolved ? "secondary" : "outline"}>{resolved ? "Résolu" : "Ouvert"}</Badge>
        {!isPendingThread && canResolve && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={resolve.isPending}
            onClick={() => resolve.mutate({ commentId: thread.id, resolved: !resolved })}
          >
            {resolved ? <RotateCcw /> : <Check />}
            {resolved ? "Rouvrir" : "Résoudre"}
          </Button>
        )}
      </div>
      {thread.comments.map((comment) => (
        <CommentBubble
          key={comment.id}
          caseId={caseId}
          comment={comment}
          canDeletePending={comment.authorId === session.user?.userId}
        />
      ))}
      {!isPendingThread &&
        (replying ? (
          <div className="space-y-2">
            <Textarea rows={2} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Votre réponse…" />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setReplying(false)}>
                Annuler
              </Button>
              <Button type="button" size="sm" disabled={!reply.trim() || addComment.isPending} onClick={sendReply}>
                Répondre
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={() => setReplying(true)}>
            Répondre
          </Button>
        ))}
    </div>
  );
}

/**
 * The comment threads anchored to ONE FA section, plus the composer — rendered
 * under the section's body in the FA accordion, exactly like a GitHub PR file
 * conversation. Whether a new comment lands pending (draft review) or visible
 * is the backend's call; the UI just shows the result.
 */
export function FaSectionComments({
  caseId,
  sectionKey,
  threads,
  canComment,
}: Readonly<{ caseId: string; sectionKey: FaSectionKey; threads: ReviewThread[]; canComment: boolean }>) {
  const [body, setBody] = useState("");
  const [composing, setComposing] = useState(false);
  const addComment = useAddReviewComment(caseId);

  if (threads.length === 0 && !canComment) return null;

  function send() {
    addComment.mutate(
      { sectionKey, body: body.trim() },
      {
        onSuccess: () => {
          setBody("");
          setComposing(false);
        },
      },
    );
  }

  return (
    <div className="mt-3 space-y-2 border-t pt-3">
      {threads.map((thread) => (
        <Thread key={thread.id} caseId={caseId} thread={thread} />
      ))}
      {canComment &&
        (composing ? (
          <div className="space-y-2">
            <Textarea
              rows={3}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Commenter cette section…"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setComposing(false)}>
                Annuler
              </Button>
              <Button type="button" size="sm" disabled={!body.trim() || addComment.isPending} onClick={send}>
                Commenter
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={() => setComposing(true)}>
            <MessageSquarePlus />
            Commenter cette section
          </Button>
        ))}
    </div>
  );
}
