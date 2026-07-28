"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "@/lib/api-error";
import { useUpdateSignatory } from "./useSignatory";
import { SignatoryFormFields } from "./signatory-form-fields";
import { signatorySchema, type Signatory, type SignatoryInput } from "./schema";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldError, FieldGroup } from "@/components/ui/field";

function toFormValues(signatory: Signatory): SignatoryInput {
  return {
    nom: signatory.nom,
    titre: signatory.titre,
    civility: signatory.civility,
    category: signatory.category,
    creationReason: signatory.creationReason,
    authorizations: signatory.authorizations,
  };
}

export function EditSignatoryDialog({
  signatory,
  open,
  onOpenChange,
}: Readonly<{ signatory: Signatory; open: boolean; onOpenChange: (open: boolean) => void }>) {
  const update = useUpdateSignatory(signatory.id);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<SignatoryInput>({ resolver: zodResolver(signatorySchema), defaultValues: toFormValues(signatory) });

  useEffect(() => {
    if (open) reset(toFormValues(signatory));
  }, [open, signatory, reset]);

  function onSubmit(values: SignatoryInput) {
    update.mutate(values, {
      onSuccess: () => onOpenChange(false),
      onError: (error) => setError("root", { message: getErrorMessage(error) }),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier le signataire</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <SignatoryFormFields control={control} />
            {errors.root && <FieldError errors={[errors.root]} />}
          </FieldGroup>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <SubmitButton formState={{ isSubmitting: update.isPending, isDirty }} requireDirty pendingLabel="Enregistrement…">
              Enregistrer
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
