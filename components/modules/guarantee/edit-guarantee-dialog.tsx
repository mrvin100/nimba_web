"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { GuaranteeFormFields } from "./guarantee-form-fields";
import { useUpdateGuarantee } from "./useGuarantee";
import { guaranteeFormSchema, type Guarantee, type GuaranteeFormInput } from "./schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";

function toFormValues(guarantee: Guarantee): GuaranteeFormInput {
  return { kind: guarantee.kind, description: guarantee.description };
}

/** Edits a guarantee's type and description. */
export function EditGuaranteeDialog({ caseId, guarantee }: Readonly<{ caseId: string; guarantee: Guarantee }>) {
  const [open, setOpen] = useState(false);
  const update = useUpdateGuarantee(caseId);
  const form = useForm<GuaranteeFormInput>({
    resolver: zodResolver(guaranteeFormSchema),
    defaultValues: toFormValues(guarantee),
  });

  function onOpenChange(next: boolean) {
    if (next) form.reset(toFormValues(guarantee));
    setOpen(next);
  }

  function onSubmit(values: GuaranteeFormInput) {
    update.mutate(
      { id: guarantee.id, input: values },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => form.setError("root", { message: getErrorMessage(error) }),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label="Modifier la garantie">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la garantie</DialogTitle>
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
