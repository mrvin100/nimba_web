"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";
import { useWorkflowState } from "@/components/modules/workflow";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { PvDraftEditor } from "./pv-draft-editor";
import { PvSnapshotView } from "./pv-snapshot-view";
import { useCreatePv, usePv } from "./usePv";
import { createPvSchema, type CreatePvInput } from "./schema";
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
 * mutations — the backend enforces this, this panel only hides the create
 * form from a viewer who couldn't use it anyway (403 would be confusing UX,
 * not a security boundary: the panel still renders a finalized PV to every
 * reviewer).
 */
export function PvPanel({ caseId }: Readonly<{ caseId: string }>) {
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
  if (!pv && workflowState?.status !== "APPROUVE") return null;

  const description = !pv
    ? "Le dossier est approuvé — le PV peut être généré."
    : pv.status === "DRAFT"
      ? "Brouillon en cours de rédaction par la DCM."
      : "Finalisé — figé au moment de sa validation.";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">PV de Comité de Crédit</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!pv && <CreatePvForm caseId={caseId} />}
        {pv?.status === "DRAFT" && <PvDraftEditor caseId={caseId} pv={pv} />}
        {pv?.status === "FINAL" && <PvSnapshotView pv={pv} />}
      </CardContent>
    </Card>
  );
}
