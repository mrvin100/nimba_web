"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import type { Department } from "@/components/modules/identity";
import { useSubmitReview } from "./useReview";
import { REVIEW_VERDICT_LABELS, VERDICTS_BY_DEPARTMENT, type ReviewVerdict } from "./schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const VERDICT_DESCRIPTIONS: Record<ReviewVerdict, string> = {
  APPROUVE: "Le dossier passe à l'analyse de la DRC.",
  CHANGEMENTS_DEMANDES: "Le dossier retourne au DRI, qui corrige puis resoumet à votre revue.",
  AVIS_FAVORABLE: "Aucune observation bloquante — le dossier passe à la vérification DCM.",
  OBSERVATIONS: "Le DRI applique vos observations ; la DCM vérifie avant l'envoi au comité.",
};

/**
 * The GitHub "Finish your review" bar: shown to the active reviewer with their
 * pending-comment count, opening the verdict dialog (radio per direction +
 * summary). Submitting fires the workflow transition and reveals the batched
 * comments at once.
 */
export function ReviewSubmitBar({
  caseId,
  department,
  pendingComments,
}: Readonly<{ caseId: string; department: Department; pendingComments: number }>) {
  const verdicts = VERDICTS_BY_DEPARTMENT[department] ?? [];
  const [open, setOpen] = useState(false);
  const [verdict, setVerdict] = useState<ReviewVerdict | null>(null);
  const [summary, setSummary] = useState("");
  const submit = useSubmitReview(caseId);

  if (verdicts.length === 0) return null;

  const requiresSummary = verdict === "CHANGEMENTS_DEMANDES" || verdict === "OBSERVATIONS";

  function send() {
    if (!verdict) return;
    submit.mutate({ verdict, summary: summary.trim() || undefined }, { onSuccess: () => setOpen(false) });
  }

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
        <p className="text-sm">
          <span className="font-medium">Revue en cours</span>
          {pendingComments > 0
            ? ` — ${pendingComments} commentaire${pendingComments > 1 ? "s" : ""} en attente de publication.`
            : " — commentez les sections puis rendez votre verdict."}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <ClipboardCheck />
              Terminer la revue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Terminer la revue</DialogTitle>
              <DialogDescription>
                Vos {pendingComments > 0 ? `${pendingComments} commentaires en attente seront publiés et ` : ""}
                le dossier suivra le verdict choisi.
              </DialogDescription>
            </DialogHeader>
            <RadioGroup value={verdict ?? ""} onValueChange={(value) => setVerdict(value as ReviewVerdict)}>
              {verdicts.map((option) => (
                <div key={option} className="flex items-start gap-2 rounded-md border p-3">
                  <RadioGroupItem value={option} id={`verdict-${option}`} className="mt-0.5" />
                  <Label htmlFor={`verdict-${option}`} className="grid gap-1 font-normal">
                    <span className="font-medium">{REVIEW_VERDICT_LABELS[option]}</span>
                    <span className="text-xs text-muted-foreground">{VERDICT_DESCRIPTIONS[option]}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Field>
              <FieldLabel htmlFor="review-summary">Commentaire général{requiresSummary ? "" : " (optionnel)"}</FieldLabel>
              <Textarea id="review-summary" rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} />
            </Field>
            <DialogFooter className="mt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </DialogClose>
              <Button onClick={send} disabled={!verdict || submit.isPending || (requiresSummary && !summary.trim())}>
                {submit.isPending ? "Envoi…" : "Soumettre la revue"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
