"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { useCreateSignatory } from "./useSignatory";
import { SignatoryFormFields } from "./signatory-form-fields";
import { signatorySchema, type SignatoryInput } from "./schema";
import { SubmitButton } from "@/components/shared/submit-button";
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
import { FieldError, FieldGroup } from "@/components/ui/field";

const DEFAULTS: SignatoryInput = { nom: "", titre: "", category: "INTERNE", creationReason: "", authorizations: [] };

export function CreateSignatoryDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateSignatory();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<SignatoryInput>({ resolver: zodResolver(signatorySchema), defaultValues: DEFAULTS });

  function onSubmit(values: SignatoryInput) {
    create.mutate(values, {
      onSuccess: () => {
        setOpen(false);
        reset(DEFAULTS);
      },
      onError: (error) => setError("root", { message: getErrorMessage(error) }),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset(DEFAULTS);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Ajouter un signataire
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter un signataire</DialogTitle>
          <DialogDescription>
            Pour une personne sans compte dans le système (personnel interne sans profil, ou personne externe à la banque).
          </DialogDescription>
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
            <SubmitButton formState={{ isSubmitting: create.isPending }} pendingLabel="Création…">
              Créer
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
