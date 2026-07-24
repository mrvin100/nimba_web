"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { useClient, useUpdateClient, type Client, type ClientFormInput } from "@/components/modules/client";
import { SubmitButton } from "@/components/shared/submit-button";
import { ClientIdentityFields } from "./client-identity-fields";
import { creditCaseKeys } from "./useCreditCase";
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

const orUndefined = (value: string | null | undefined): string | undefined => (value && value.length > 0 ? value : undefined);

/**
 * Merges the edited identity fields onto the client's current record. The client
 * update is wholesale, so the fields the identity form does not edit (raison
 * sociale, sigle, RCCM, compte) are carried over from [client] unchanged.
 */
function toClientPayload(client: Client, values: ClientIdentityInput): ClientFormInput {
  return {
    raisonSociale: client.raisonSociale,
    sigle: orUndefined(client.sigle),
    rccm: orUndefined(client.rccm),
    accountNumber: orUndefined(client.accountNumber),
    formeJuridique: orUndefined(values.formeJuridique),
    dateCreation: values.dateCreation,
    adressePhysique: orUndefined(values.adressePhysique),
    activiteDeBase: orUndefined(values.activiteDeBase),
    codeNif: orUndefined(values.codeNif),
    principalDirigeant: orUndefined(values.principalDirigeant),
    dateEntreeRelation: values.dateEntreeRelation,
    dateDerniereVisite: values.dateDerniereVisite,
    agence: orUndefined(values.agence),
    gestionnaire: orUndefined(values.gestionnaire),
    analyste: orUndefined(values.analyste),
    cotationPrecedente: orUndefined(values.cotationPrecedente),
    cotationActuelle: orUndefined(values.cotationActuelle),
  };
}

/**
 * Edits the client-identity details reused across the FA, the PV and the FMP.
 * Identity now lives on the client (the single source), so this updates the client
 * record and refreshes the dossier's derived copy.
 */
export function EditClientIdentityDialog({
  caseId,
  clientId,
  identity,
}: Readonly<{ caseId: string; clientId: string; identity: ClientIdentity }>) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: client } = useClient(clientId);
  const update = useUpdateClient(clientId);
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
    if (!client) return;
    update.mutate(toClientPayload(client, values), {
      onSuccess: () => {
        // The dossier's identity is derived from the client record — refresh it.
        queryClient.invalidateQueries({ queryKey: creditCaseKeys.detail(caseId) });
        setOpen(false);
      },
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
            Réutilisée sur la fiche d&apos;analyse, le PV et la fiche de mise en place — enregistrée sur la fiche client.
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
