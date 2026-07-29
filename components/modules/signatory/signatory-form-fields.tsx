"use client";

import { Controller, type Control } from "react-hook-form";
import { SIGNATORY_CATEGORIES, SIGNATORY_CATEGORY_LABELS, type SignatoryInput } from "./schema";
import { SignatoryAuthorizationFields } from "./signatory-authorization-fields";
import { CIVILITIES, CIVILITY_LABELS } from "@/components/modules/identity";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/** Shared by the create and edit signatory dialogs so the two can never diverge. */
export function SignatoryFormFields({ control }: Readonly<{ control: Control<SignatoryInput> }>) {
  return (
    <>
      <Controller
        control={control}
        name="nom"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Nom complet</FieldLabel>
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={control}
        name="titre"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Titre</FieldLabel>
            <Input {...field} id={field.name} placeholder="Directeur Général" aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={control}
        name="civility"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Civilité</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CIVILITIES.map((civility) => (
                  <SelectItem key={civility} value={civility}>
                    {CIVILITY_LABELS[civility]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={control}
        name="category"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Catégorie</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIGNATORY_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {SIGNATORY_CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={control}
        name="creationReason"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Motif de création</FieldLabel>
            <Textarea {...field} id={field.name} placeholder="Pourquoi ce signataire est-il ajouté sans compte ?" aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <SignatoryAuthorizationFields control={control} />
    </>
  );
}
