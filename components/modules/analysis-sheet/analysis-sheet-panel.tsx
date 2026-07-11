"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileCheck2, Lock } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { formatAmount, formatDate } from "@/lib/format";
import { useLatestSchedule } from "@/components/modules/amortization-schedule";
import { SubmitButton } from "@/components/shared/submit-button";
import { useAnalysisSheet, useCreateAnalysisSheet, usePublishAnalysisSheet, useUpdateAnalysisSheetContent } from "./useAnalysisSheet";
import { AnalysisSheetStatusBadge } from "./analysis-sheet-status-badge";
import { analysisSheetContentSchema, type AnalysisSheetContentInput } from "./schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

/**
 * Constitution status of a dossier's Fiche d'analyse, driven entirely from server
 * state (like the amortization panel): not startable until the TA exists, then
 * initiate → edit the draft → publish (which locks it). `content` is a
 * placeholder free-text field standing in for the real per-variant FA structure.
 */
export function AnalysisSheetPanel({ caseId }: Readonly<{ caseId: string }>) {
  const { data: schedule, isPending: schedulePending } = useLatestSchedule(caseId);
  const { data: sheet, isPending: sheetPending } = useAnalysisSheet(caseId);
  const createSheet = useCreateAnalysisSheet(caseId);
  const publishSheet = usePublishAnalysisSheet(caseId);
  const updateContent = useUpdateAnalysisSheetContent(caseId);

  const form = useForm<AnalysisSheetContentInput>({
    resolver: zodResolver(analysisSheetContentSchema),
    // Tracks the query's content whenever it changes (e.g. after a save), instead
    // of a one-time default — this component has no "open" event to reset on.
    values: { content: sheet?.content ?? "" },
  });

  const isPending = schedulePending || sheetPending;

  function onSubmit(values: AnalysisSheetContentInput) {
    updateContent.mutate(values, {
      onError: (error) => form.setError("root", { message: getErrorMessage(error) }),
    });
  }

  const description = isPending
    ? "Chargement…"
    : sheet
      ? sheet.status === "PUBLISHED"
        ? "Publiée — le dossier est prêt pour la revue DCM."
        : "Brouillon en cours de rédaction."
      : schedule
        ? "Prête à être initiée depuis l'échéancier importé."
        : "Importez d'abord l'échéancier.";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-base">Fiche d&apos;analyse</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {sheet && <AnalysisSheetStatusBadge status={sheet.status} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : !schedule ? (
          <Alert>
            <AlertTitle>Aucun échéancier importé</AlertTitle>
            <AlertDescription>
              La fiche d&apos;analyse reprend les chiffres du tableau d&apos;amortissement — importez-le d&apos;abord
              depuis l&apos;onglet Amortissement.
            </AlertDescription>
          </Alert>
        ) : !sheet ? (
          <Button onClick={() => createSheet.mutate()} disabled={createSheet.isPending}>
            <FileCheck2 />
            {createSheet.isPending ? "Initiation…" : "Initier la fiche d'analyse"}
          </Button>
        ) : (
          <>
            {sheet.taSummary && (
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  Montant financé {formatAmount(sheet.taSummary.loanAmount)} · {sheet.taSummary.durationMonths} échéances
                  · {formatDate(sheet.taSummary.startDate)} → {formatDate(sheet.taSummary.endDate)}
                </p>
                <p>
                  Équipement {formatAmount(sheet.taSummary.totalEquipement)} · Assurance{" "}
                  {formatAmount(sheet.taSummary.totalAssurance)} · Tracking {formatAmount(sheet.taSummary.totalTracking)} ·
                  Immatriculation {formatAmount(sheet.taSummary.totalImmatriculation)}
                </p>
                <p>
                  1er loyer TTC {formatAmount(sheet.taSummary.premierLoyerTtc)} · Loyer mensuel HT{" "}
                  {formatAmount(sheet.taSummary.loyerMensuelHt)} · Valeur résiduelle{" "}
                  {formatAmount(sheet.taSummary.valeurResiduelle)}
                </p>
              </div>
            )}

            {sheet.status === "PUBLISHED" ? (
              <div className="flex items-start gap-2 rounded-md border p-3 text-sm">
                <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="whitespace-pre-wrap">{sheet.content || "Aucune note."}</p>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
                <Controller
                  control={form.control}
                  name="content"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Notes d&apos;analyse</FieldLabel>
                      <Textarea
                        {...field}
                        id={field.name}
                        rows={6}
                        placeholder="Structure détaillée à venir — notes libres pour l'instant."
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                {form.formState.errors.root && (
                  <Field data-invalid>
                    <FieldError errors={[form.formState.errors.root]} />
                  </Field>
                )}
                <div className="flex justify-end gap-2">
                  <SubmitButton
                    formState={{ isSubmitting: updateContent.isPending, isDirty: form.formState.isDirty }}
                    requireDirty
                    pendingLabel="Enregistrement…"
                    variant="outline"
                  >
                    Enregistrer le brouillon
                  </SubmitButton>
                  <Button type="button" onClick={() => publishSheet.mutate()} disabled={publishSheet.isPending}>
                    {publishSheet.isPending ? "Publication…" : "Publier"}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
