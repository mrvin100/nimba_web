"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { GuaranteeFormFields } from "./guarantee-form-fields";
import { useCreateGuarantee } from "./useGuarantee";
import { guaranteeFormSchema, type GuaranteeFormInput } from "./schema";
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

const DEFAULTS: GuaranteeFormInput = { kind: "A_RECUEILLIR", description: "" };

/** Adds a guarantee to the dossier. */
export function CreateGuaranteeDialog({ caseId }: Readonly<{ caseId: string }>) {
  const [open, setOpen] = useState(false);
  const createGuarantee = useCreateGuarantee(caseId);
  const form = useForm<GuaranteeFormInput>({
    resolver: zodResolver(guaranteeFormSchema),
    defaultValues: DEFAULTS,
  });

  function onOpenChange(next: boolean) {
    if (next) form.reset(DEFAULTS);
    setOpen(next);
  }

  function onSubmit(values: GuaranteeFormInput) {
    createGuarantee.mutate(values, {
      onSuccess: () => setOpen(false),
      onError: (error) => form.setError("root", { message: getErrorMessage(error) }),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus />
          Ajouter une garantie
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle garantie</DialogTitle>
          <DialogDescription>Réutilisée sur la fiche d&apos;analyse, le PV et la fiche de mise en place.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <GuaranteeFormFields control={form.control} />
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
            <SubmitButton formState={{ isSubmitting: createGuarantee.isPending }} pendingLabel="Ajout…">
              Ajouter
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
