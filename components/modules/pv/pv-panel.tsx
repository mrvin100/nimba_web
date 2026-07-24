"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";
import { useSession } from "@/components/modules/identity";
import { useWorkflowState } from "@/components/modules/workflow";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { PvDraftEditor } from "./pv-draft-editor";
import { PvSnapshotView } from "./pv-snapshot-view";
import { pvDocxExportPath } from "./pv.service";
import { useCreatePv, usePv } from "./usePv";
import { createPvSchema, type CreatePvInput } from "./schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function CreatePvForm({ caseId }: Readonly<{ caseId: string }>) {
  const create = useCreatePv(caseId);
  const form = useForm<CreatePvInput>({
    resolver: zodResolver(createPvSchema),
    defaultValues: { seanceDate: "" },
  });

  function onSubmit(values: CreatePvInput) {
    create.mutate(values, { onError: (error) => form.setError("root", { message: getErrorMessage(error) }) });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex items-end gap-3">
      <FieldGroup className="flex-1">
        <Controller
          control={form.control}
          name="seanceDate"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Date de séance</FieldLabel>
              <Input {...field} type="date" id={field.name} aria-invalid={fieldState.invalid} className="max-w-48" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {form.formState.errors.root && (
          <Field data-invalid>
            <FieldError errors={[form.formState.errors.root]} />
          </Field>
        )}
      </FieldGroup>
      <SubmitButton formState={{ isSubmitting: create.isPending }} pendingLabel="Génération…">
        <FileText />
        Générer le PV
      </SubmitButton>
    </form>
  );
}

/**
 * The dossier's PV: not generatable until the comité approves it (§10.3), then
 * a DCM-drafted document (séance date, débats, points forts/faibles,
 * rapporteur/président) that becomes immutable once finalized. DCM-only
 * mutations — the backend enforces this, but the create form is also hidden
 * from every other direction here so a DRI/DRC/comité viewer never sees an
 * action they'd just get a 403 on; the panel still renders a finalized PV to
 * every reviewer once one exists.
 */
export function PvPanel({ caseId }: Readonly<{ caseId: string }>) {
  const session = useSession();
  const { data: workflowState, isPending: workflowPending } = useWorkflowState(caseId);
  const { data: pv, isPending: pvPending } = usePv(caseId);

  const isPending = workflowPending || pvPending;
  if (isPending) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Not yet reachable: the comité hasn't approved the dossier and no PV exists.
  if (!pv && workflowState?.status !== "APPROUVE") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">PV de Comité de Crédit</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Pas encore disponible</AlertTitle>
            <AlertDescription>
              Le PV ne peut être généré qu&apos;une fois le dossier approuvé par le comité de crédit.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const description = !pv
    ? session.hasDepartment("DCM")
      ? "Le dossier est approuvé, le PV peut être généré."
      : "Le dossier est approuvé, en attente de génération du PV par la DCM."
    : pv.status === "DRAFT"
      ? "Brouillon en cours de rédaction par la DCM."
      : "Finalisé, figé au moment de sa validation.";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-base">PV de Comité de Crédit</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {pv?.status === "FINAL" && (
            <Button variant="outline" size="sm" asChild>
              <a href={pvDocxExportPath(caseId)} download>
                <FileText />
                Exporter (.docx)
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!pv && session.hasDepartment("DCM") && <CreatePvForm caseId={caseId} />}
        {pv?.status === "DRAFT" && <PvDraftEditor caseId={caseId} pv={pv} />}
        {pv?.status === "FINAL" && <PvSnapshotView pv={pv} />}
      </CardContent>
    </Card>
  );
}
