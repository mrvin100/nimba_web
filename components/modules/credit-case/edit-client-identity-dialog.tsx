"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { ClientIdentityFields } from "./client-identity-fields";
import { useUpdateClientIdentity } from "./useCreditCase";
import { clientIdentitySchema, type ClientIdentity, type ClientIdentityInput } from "./schema";
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

function toFormValues(identity: ClientIdentity): ClientIdentityInput {
  return {
    formeJuridique: identity.formeJuridique ?? "",
    dateCreation: identity.dateCreation ?? undefined,
    adressePhysique: identity.adressePhysique ?? "",
    activiteDeBase: identity.activiteDeBase ?? "",
    codeNif: identity.codeNif ?? "",
    principalDirigeant: identity.principalDirigeant ?? "",
    dateEntreeRelation: identity.dateEntreeRelation ?? undefined,
    dateDerniereVisite: identity.dateDerniereVisite ?? undefined,
    agence: identity.agence ?? "",
    gestionnaire: identity.gestionnaire ?? "",
    analyste: identity.analyste ?? "",
    cotationPrecedente: identity.cotationPrecedente ?? "",
    cotationActuelle: identity.cotationActuelle ?? "",
  };
}

/** Edits the client-identity details reused across the FA, the PV and the FMP. */
export function EditClientIdentityDialog({ caseId, identity }: Readonly<{ caseId: string; identity: ClientIdentity }>) {
  const [open, setOpen] = useState(false);
  const update = useUpdateClientIdentity(caseId);
  const form = useForm<ClientIdentityInput>({
    resolver: zodResolver(clientIdentitySchema),
    defaultValues: toFormValues(identity),
  });

  function onOpenChange(next: boolean) {
    if (next) {
      form.reset(toFormValues(identity));
    }
    setOpen(next);
  }

  function onSubmit(values: ClientIdentityInput) {
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
          <DialogTitle>Identité du client</DialogTitle>
          <DialogDescription>
            Réutilisée sur la fiche d&apos;analyse, le PV et la fiche de mise en place — à ne renseigner qu&apos;une fois.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <ClientIdentityFields control={form.control} />
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
