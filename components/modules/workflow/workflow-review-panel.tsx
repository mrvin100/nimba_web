"use client";

import { useState } from "react";
import { Send, TriangleAlert, XCircle } from "lucide-react";
import { DEPARTMENT_LABELS } from "@/components/modules/identity";
import { useWorkflowAction, useWorkflowState } from "./useWorkflow";
import { WorkflowStatusBadge } from "./workflow-status-badge";
import { WorkflowTimeline } from "./workflow-timeline";
import { WORKFLOW_REVIEW_DEPARTMENT, type WorkflowActionType } from "./schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

/** APPROVE (comment optional) / REQUEST_CHANGES / REQUEST_COMPLETION (comment required). */
function CommentActionDialog({
  caseId,
  action,
  triggerLabel,
  title,
  description,
  requireComment,
  variant = "default",
}: Readonly<{
  caseId: string;
  action: WorkflowActionType;
  triggerLabel: string;
  title: string;
  description: string;
  requireComment: boolean;
  variant?: "default" | "outline";
}>) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const act = useWorkflowAction(caseId);

  function submit() {
    act.mutate({ action, comment: comment.trim() || undefined }, { onSuccess: () => setOpen(false) });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant}>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="workflow-comment">Commentaire{requireComment ? "" : " (optionnel)"}</FieldLabel>
          <Textarea id="workflow-comment" rows={4} value={comment} onChange={(event) => setComment(event.target.value)} />
        </Field>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </DialogClose>
          <Button onClick={submit} disabled={act.isPending || (requireComment && !comment.trim())}>
            {act.isPending ? "Envoi…" : triggerLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** REJECT: destructive and irreversible (archives the dossier), so it confirms through an AlertDialog. */
function RejectAction({ caseId }: Readonly<{ caseId: string }>) {
  const [comment, setComment] = useState("");
  const act = useWorkflowAction(caseId);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <XCircle /> Rejeter
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rejeter le dossier</AlertDialogTitle>
          <AlertDialogDescription>
            Le dossier sera archivé avec le motif indiqué. Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field>
          <FieldLabel htmlFor="reject-comment">Motif du rejet</FieldLabel>
          <Textarea id="reject-comment" rows={4} value={comment} onChange={(event) => setComment(event.target.value)} />
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            disabled={act.isPending || !comment.trim()}
            onClick={() => act.mutate({ action: "REJECT", comment })}
          >
            Rejeter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * The dossier's cross-directorate workflow: status, whoever's turn it is, the
 * actions the CALLER may take right now (server-derived — empty when it is not
 * their turn, so this panel never needs to know who the viewer is), and the
 * timeline. Shared as-is by every direction's dossier view.
 */
export function WorkflowReviewPanel({ caseId }: Readonly<{ caseId: string }>) {
  const { data: state, isPending } = useWorkflowState(caseId);
  const submit = useWorkflowAction(caseId);

  if (isPending) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!state) return null;

  const waitingDepartment = WORKFLOW_REVIEW_DEPARTMENT[state.status];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base">Suivi du dossier</CardTitle>
          <WorkflowStatusBadge status={state.status} />
        </div>
        {state.status === "PRET_POUR_COMITE" && (
          <CardDescription>
            {state.comiteApprovals}/{state.comiteApprovalsRequired} approbations du comité
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {state.hint && (
          <Alert>
            <TriangleAlert />
            <AlertDescription>{state.hint}</AlertDescription>
          </Alert>
        )}

        {state.availableActions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {state.availableActions.includes("SUBMIT") && (
              <Button onClick={() => submit.mutate({ action: "SUBMIT" })} disabled={submit.isPending}>
                <Send /> Soumettre à la revue
              </Button>
            )}
            {state.availableActions.includes("APPROVE") && (
              <CommentActionDialog
                caseId={caseId}
                action="APPROVE"
                triggerLabel="Approuver"
                title="Approuver le dossier"
                description="Le dossier passe à l'étape suivante de la revue."
                requireComment={false}
              />
            )}
            {state.availableActions.includes("REQUEST_CHANGES") && (
              <CommentActionDialog
                caseId={caseId}
                action="REQUEST_CHANGES"
                triggerLabel="Demander des modifications"
                variant="outline"
                title="Demander des modifications"
                description="Le dossier retourne au DRI ; expliquez ce qui doit être corrigé."
                requireComment
              />
            )}
            {state.availableActions.includes("REQUEST_COMPLETION") && (
              <CommentActionDialog
                caseId={caseId}
                action="REQUEST_COMPLETION"
                triggerLabel="Renvoyer pour complément"
                variant="outline"
                title="Renvoyer pour complément"
                description="Le dossier retourne au DRI pour compléter des documents ou informations."
                requireComment
              />
            )}
            {state.availableActions.includes("REJECT") && <RejectAction caseId={caseId} />}
          </div>
        ) : (
          !state.hint &&
          waitingDepartment && (
            <p className="text-sm text-muted-foreground">En attente de la direction {DEPARTMENT_LABELS[waitingDepartment]}.</p>
          )
        )}

        <Separator />

        <div>
          <p className="mb-2 text-sm font-medium">Historique</p>
          <WorkflowTimeline events={state.timeline} />
        </div>
      </CardContent>
    </Card>
  );
}
