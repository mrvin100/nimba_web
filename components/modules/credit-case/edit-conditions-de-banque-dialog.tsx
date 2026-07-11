"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { ConditionsDeBanqueFields } from "./conditions-de-banque-fields";
import { useUpdateConditionsDeBanque } from "./useCreditCase";
import { conditionsDeBanqueSchema, type ConditionsDeBanque, type ConditionsDeBanqueInput } from "./schema";
import { Button } from "@/components/ui/button";
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
import { Field, FieldError, FieldGroup } from "@/components/ui/field";

function toFormValues(conditions: ConditionsDeBanque): ConditionsDeBanqueInput {
  return {
    tauxInteretPct: conditions.tauxInteretPct ?? undefined,
    fraisMiseEnPlacePct: conditions.fraisMiseEnPlacePct ?? undefined,
    comEngagementPct: conditions.comEngagementPct ?? undefined,
    fraisEtudesPct: conditions.fraisEtudesPct ?? undefined,
    fraisDivers: conditions.fraisDivers,
  };
}

/** Edits the conditions-de-banque details reused across the FA, the PV and the FMP. */
export function EditConditionsDeBanqueDialog({
  caseId,
  conditions,
}: Readonly<{ caseId: string; conditions: ConditionsDeBanque }>) {
  const [open, setOpen] = useState(false);
  const update = useUpdateConditionsDeBanque(caseId);
  const form = useForm<ConditionsDeBanqueInput>({
    resolver: zodResolver(conditionsDeBanqueSchema),
    defaultValues: toFormValues(conditions),
  });

  function onOpenChange(next: boolean) {
    if (next) form.reset(toFormValues(conditions));
    setOpen(next);
  }

  function onSubmit(values: ConditionsDeBanqueInput) {
    update.mutate(values, {
      onSuccess: () => setOpen(false),
      onError: (error) => form.setError("root", { message: getErrorMessage(error) }),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Conditions de banque</DialogTitle>
          <DialogDescription>
            Réutilisées sur la fiche d&apos;analyse, le PV et la fiche de mise en place — le 1er loyer, le loyer
            mensuel, la durée et la valeur résiduelle viennent directement de l&apos;échéancier importé.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <ConditionsDeBanqueFields control={form.control} />
            {form.formState.errors.root && (
              <Field data-invalid>
                <FieldError errors={[form.formState.errors.root]} />
              </Field>
            )}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <SubmitButton
              formState={{ isSubmitting: update.isPending, isDirty: form.formState.isDirty }}
              requireDirty
              pendingLabel="Enregistrement…"
            >
              Enregistrer
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
