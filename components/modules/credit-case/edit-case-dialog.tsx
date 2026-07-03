"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { CaseFormFields } from "./case-form-fields";
import { useUpdateCreditCase } from "./useCreditCase";
import { caseFormSchema, type CaseFormInput, type CreditCase } from "./schema";
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

function toFormValues(creditCase: CreditCase): CaseFormInput {
  return {
    clientName: creditCase.clientName,
    productType: creditCase.productType,
    currency: creditCase.currency,
    accountNumber: creditCase.accountNumber ?? "",
  };
}

/** Edits a credit case's general information (client, product, currency, compte). */
export function EditCaseDialog({ creditCase }: { creditCase: CreditCase }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateCreditCase(creditCase.id);
  const form = useForm<CaseFormInput>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: toFormValues(creditCase),
  });

  // Reset to the case's current values each time the dialog opens (no effect needed).
  function onOpenChange(next: boolean) {
    if (next) {
      form.reset(toFormValues(creditCase));
    }
    setOpen(next);
  }

  function onSubmit(values: CaseFormInput) {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le dossier</DialogTitle>
          <DialogDescription>{creditCase.caseNumber} — le numéro de dossier n&apos;est pas modifiable.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <CaseFormFields control={form.control} />
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
            <SubmitButton formState={{ isSubmitting: update.isPending, isDirty: form.formState.isDirty }} requireDirty pendingLabel="Enregistrement…">
              Enregistrer
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
