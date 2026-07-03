"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { caseDetailPath } from "@/lib/constants";
import { SubmitButton } from "@/components/shared/submit-button";
import { CaseFormFields } from "./case-form-fields";
import { useCreateCreditCase } from "./useCreditCase";
import { caseFormSchema, type CaseFormInput } from "./schema";
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

export function CreateCaseDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const createCase = useCreateCreditCase();
  const form = useForm<CaseFormInput>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: { clientName: "", productType: "LEASING", currency: "GNF", accountNumber: "" },
  });

  function onSubmit(values: CaseFormInput) {
    createCase.mutate(values, {
      onSuccess: (created) => {
        setOpen(false);
        form.reset();
        router.push(caseDetailPath(created.id));
      },
      onError: (error) => form.setError("root", { message: getErrorMessage(error) }),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nouveau dossier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau dossier</DialogTitle>
          <DialogDescription>Renseignez le client et le type de produit.</DialogDescription>
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
            <SubmitButton formState={{ isSubmitting: createCase.isPending }} pendingLabel="Création…">
              Créer le dossier
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
