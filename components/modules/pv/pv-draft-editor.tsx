"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { PvDebatFields } from "./pv-debat-fields";
import { useFinalizePv, useUpdatePvDraft } from "./usePv";
import { updatePvDraftSchema, type Pv, type UpdatePvDraftInput } from "./schema";
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
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function toFormValues(pv: Pv): UpdatePvDraftInput {
  return {
    seanceDate: pv.seanceDate,
    rapporteur: pv.rapporteur ?? "",
    president: pv.president ?? "",
    debats: pv.debats,
  };
}

/**
 * The DCM's draft editor — every field here locks the instant the PV is
 * finalized. Points forts/faibles are deliberately absent: they live on the
 * FA (captured once by the analyst), the PV only reuses them at finalization.
 */
export function PvDraftEditor({ caseId, pv }: Readonly<{ caseId: string; pv: Pv }>) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const update = useUpdatePvDraft(caseId);
  const finalize = useFinalizePv(caseId);
  const form = useForm<UpdatePvDraftInput>({
    resolver: zodResolver(updatePvDraftSchema),
    values: toFormValues(pv),
  });

  function onSubmit(values: UpdatePvDraftInput) {
    update.mutate(values, {
      onError: (error) => form.setError("root", { message: getErrorMessage(error) }),
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Controller
              control={form.control}
              name="seanceDate"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Date de séance</FieldLabel>
                  <Input {...field} type="date" id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="rapporteur"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Rapporteur</FieldLabel>
                  <Input {...field} value={field.value ?? ""} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="president"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Président</FieldLabel>
                  <Input {...field} value={field.value ?? ""} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <PvDebatFields control={form.control} />

          {form.formState.errors.root && (
            <Field data-invalid>
              <FieldError errors={[form.formState.errors.root]} />
            </Field>
          )}
        </FieldGroup>

        <div className="flex justify-end">
          <SubmitButton
            formState={{ isSubmitting: update.isPending, isDirty: form.formState.isDirty }}
            requireDirty
            pendingLabel="Enregistrement…"
            variant="outline"
          >
            Enregistrer le brouillon
          </SubmitButton>
        </div>
      </form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogTrigger asChild>
          <Button type="button" disabled={form.formState.isDirty}>
            <Lock />
            Finaliser le PV
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finaliser le PV ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le PV devient définitif : l&apos;identité client, l&apos;articulation du financement, les garanties, les
              conditions de banque et les points forts/faibles de la fiche d&apos;analyse sont figés tels qu&apos;ils
              sont aujourd&apos;hui. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => finalize.mutate()} disabled={finalize.isPending}>
              {finalize.isPending ? "Finalisation…" : "Finaliser"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {form.formState.isDirty && (
        <p className="text-xs text-muted-foreground">Enregistrez le brouillon avant de finaliser.</p>
      )}
    </div>
  );
}
