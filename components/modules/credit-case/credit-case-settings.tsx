"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { useSession } from "@/components/modules/identity";
import { useWorkflowState } from "@/components/modules/workflow";
import { useCreditCase, useDeleteCreditCase, useResetCaseDocument } from "./useCreditCase";
import type { ResettableDocument } from "./credit-case.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const RESETTABLE: { document: ResettableDocument; label: string; description: string }[] = [
  {
    document: "AMORTISSEMENT",
    label: "Tableau d'amortissement",
    description: "Supprime l'échéancier importé, ses versions et les traites générées.",
  },
  {
    document: "FICHE_ANALYSE",
    label: "Fiche d'analyse",
    description: "Supprime la FA, toutes ses sections, ses images et les fils de revue associés.",
  },
  { document: "GARANTIES", label: "Garanties", description: "Supprime les garanties et leurs pièces jointes." },
  { document: "PV", label: "Procès-verbal", description: "Supprime le PV du comité de crédit." },
  { document: "FMP", label: "Fiche de mise en place", description: "Supprime la FMP." },
];

function ResetAction({
  caseId,
  caseNumber,
  document,
  label,
  description,
  disabled,
}: Readonly<{
  caseId: string;
  caseNumber: string;
  document: ResettableDocument;
  label: string;
  description: string;
  disabled: boolean;
}>) {
  const reset = useResetCaseDocument(caseId);
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" disabled={disabled || reset.isPending}>
            Réinitialiser
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser « {label} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              {description} Toutes les données saisies pour le dossier {caseNumber} sur ce document seront
              définitivement perdues. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => reset.mutate(document)}
            >
              Réinitialiser définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DeleteAction({
  caseId,
  caseNumber,
  backHref,
}: Readonly<{ caseId: string; caseNumber: string; backHref: string }>) {
  const router = useRouter();
  const remove = useDeleteCreditCase();
  const [confirmation, setConfirmation] = useState("");

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">Supprimer le dossier</p>
        <p className="text-sm text-muted-foreground">
          Supprime définitivement le dossier et tout ce qui s&apos;y rattache (TA, FA, garanties, PV, FMP, workflow).
        </p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={remove.isPending}>
            Supprimer
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le dossier {caseNumber} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Toutes les données de ce dossier seront définitivement perdues. Saisissez « {caseNumber} » pour
              confirmer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={caseNumber}
            aria-label="Confirmation du numéro de dossier"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmation("")}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              disabled={confirmation !== caseNumber}
              onClick={() => remove.mutate(caseId, { onSuccess: () => router.push(backHref) })}
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * The dossier's Settings tab (`?tab=parametres`) — the critical actions zone.
 * Resets are for DRI managers and administrators, only while the dossier is
 * BROUILLON (the backend enforces both; the UI mirrors the gates). Deleting
 * the dossier stays an administrator act.
 */
export function CreditCaseSettings({ caseId, backHref }: Readonly<{ caseId: string; backHref?: string }>) {
  const session = useSession();
  const { data: creditCase } = useCreditCase(caseId);
  const { data: workflowState } = useWorkflowState(caseId);

  const canReset = session.isManager("DRI") || session.isAdmin;
  const isBrouillon = workflowState?.status === "BROUILLON";

  if (!creditCase) return null;

  if (!canReset && !session.isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paramètres du dossier</CardTitle>
          <CardDescription>Les actions critiques sont réservées aux managers DRI et aux administrateurs.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-base">Zone critique</CardTitle>
        <CardDescription>
          Actions irréversibles sur le dossier {creditCase.caseNumber} — chaque action demande une confirmation
          explicite.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isBrouillon && (
          <Alert className="mb-4">
            <TriangleAlert />
            <AlertDescription>
              Le dossier n&apos;est plus en brouillon : les réinitialisations sont désactivées tant qu&apos;il est en
              revue ou approuvé.
            </AlertDescription>
          </Alert>
        )}

        {canReset && (
          <div className="divide-y">
            {RESETTABLE.map(({ document, label, description }) => (
              <ResetAction
                key={document}
                caseId={caseId}
                caseNumber={creditCase.caseNumber}
                document={document}
                label={label}
                description={description}
                disabled={!isBrouillon}
              />
            ))}
          </div>
        )}

        {session.isAdmin && (
          <>
            <Separator className="my-2" />
            <DeleteAction caseId={caseId} caseNumber={creditCase.caseNumber} backHref={backHref ?? "/"} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
