"use client";

import { Controller, type Control } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ClientIdentityInput } from "./schema";

const TEXT_FIELDS = [
  { name: "formeJuridique", label: "Forme juridique" },
  { name: "adressePhysique", label: "Adresse physique" },
  { name: "activiteDeBase", label: "Activité de base" },
  { name: "codeNif", label: "Code NIF" },
  { name: "principalDirigeant", label: "Principal dirigeant" },
  { name: "agence", label: "Agence" },
  { name: "gestionnaire", label: "Gestionnaire" },
  { name: "analyste", label: "Analyste" },
  { name: "cotationPrecedente", label: "Cotation précédente" },
  { name: "cotationActuelle", label: "Cotation actuelle" },
] as const satisfies ReadonlyArray<{ name: keyof ClientIdentityInput; label: string }>;

const DATE_FIELDS = [
  { name: "dateCreation", label: "Date de création" },
  { name: "dateEntreeRelation", label: "Date d'entrée en relation" },
  { name: "dateDerniereVisite", label: "Date de dernière visite" },
] as const satisfies ReadonlyArray<{ name: keyof ClientIdentityInput; label: string }>;

/** The client-identity form's fields, shared by the edit dialog's single form. */
export function ClientIdentityFields({ control }: { control: Control<ClientIdentityInput> }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {TEXT_FIELDS.map(({ name, label }) => (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
              <Input {...field} value={field.value ?? ""} id={field.name} aria-invalid={fieldState.invalid} autoComplete="off" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      ))}
      {DATE_FIELDS.map(({ name, label }) => (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
              <Input {...field} value={field.value ?? ""} type="date" id={field.name} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      ))}
    </div>
  );
}
