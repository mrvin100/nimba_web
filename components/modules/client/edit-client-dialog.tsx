"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useUpdateClient } from "./useClient";
import { updateClientSchema, type Client, type UpdateClientFormInput } from "./schema";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/** Text fields rendered two-per-row after the raison sociale. */
const TEXT_FIELDS: ReadonlyArray<{ name: keyof UpdateClientFormInput; label: string }> = [
  { name: "sigle", label: "Sigle" },
  { name: "formeJuridique", label: "Forme juridique" },
  { name: "codeNif", label: "Code NIF" },
  { name: "rccm", label: "RCCM" },
  { name: "accountNumber", label: "N° de compte" },
  { name: "principalDirigeant", label: "Principal dirigeant" },
  { name: "adressePhysique", label: "Adresse physique" },
  { name: "activiteDeBase", label: "Activité de base" },
  { name: "agence", label: "Agence" },
  { name: "gestionnaire", label: "Gestionnaire" },
  { name: "analyste", label: "Analyste" },
  { name: "cotationPrecedente", label: "Cotation précédente" },
  { name: "cotationActuelle", label: "Cotation actuelle" },
];

const DATE_FIELDS: ReadonlyArray<{ name: keyof UpdateClientFormInput; label: string }> = [
  { name: "dateCreation", label: "Date de création" },
  { name: "dateEntreeRelation", label: "Date d'entrée en relation" },
  { name: "dateDerniereVisite", label: "Date de dernière visite" },
];

function toFormValues(client: Client): UpdateClientFormInput {
  return {
    raisonSociale: client.raisonSociale,
    sigle: client.sigle ?? "",
    formeJuridique: client.formeJuridique ?? "",
    dateCreation: client.dateCreation ?? undefined,
    adressePhysique: client.adressePhysique ?? "",
    activiteDeBase: client.activiteDeBase ?? "",
    codeNif: client.codeNif ?? "",
    rccm: client.rccm ?? "",
    accountNumber: client.accountNumber ?? "",
    principalDirigeant: client.principalDirigeant ?? "",
    dateEntreeRelation: client.dateEntreeRelation ?? undefined,
    dateDerniereVisite: client.dateDerniereVisite ?? undefined,
    agence: client.agence ?? "",
    gestionnaire: client.gestionnaire ?? "",
    analyste: client.analyste ?? "",
    cotationPrecedente: client.cotationPrecedente ?? "",
    cotationActuelle: client.cotationActuelle ?? "",
  };
}

/** Edits every descriptive field of a client (matricule excluded — it is immutable). */
export function EditClientDialog({ client }: Readonly<{ client: Client }>) {
  const [open, setOpen] = useState(false);
  const update = useUpdateClient(client.id);
  const form = useForm<UpdateClientFormInput>({
    resolver: zodResolver(updateClientSchema),
    defaultValues: toFormValues(client),
  });

  function onOpenChange(next: boolean) {
    if (next) {
      form.reset(toFormValues(client));
    }
    setOpen(next);
  }

  function onSubmit(values: UpdateClientFormInput) {
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
          Modifier la fiche
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fiche client</DialogTitle>
          <DialogDescription>
            {client.matricule ? `Matricule ${client.matricule}` : "Matricule non renseigné"} — non modifiable.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={form.control}
              name="raisonSociale"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Raison sociale</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              {TEXT_FIELDS.map(({ name, label }) => (
                <Controller
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                      <Input {...field} value={field.value ?? ""} id={field.name} aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              ))}
              {DATE_FIELDS.map(({ name, label }) => (
                <Controller
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                      <Input {...field} value={field.value ?? ""} id={field.name} type="date" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              ))}
            </div>
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
