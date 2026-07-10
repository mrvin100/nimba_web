"use client";

import { Controller, type Control } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GUARANTEE_KIND_LABELS, GUARANTEE_KINDS, type GuaranteeFormInput } from "./schema";

/** The guarantee write form's fields, shared by the create and edit dialogs. */
export function GuaranteeFormFields({ control }: Readonly<{ control: Control<GuaranteeFormInput> }>) {
  return (
    <>
      <Controller
        control={control}
        name="kind"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Type de garantie</FieldLabel>
            <Select name={field.name} value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                {GUARANTEE_KINDS.map((kind) => (
                  <SelectItem key={kind} value={kind}>
                    {GUARANTEE_KIND_LABELS[kind]}
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
        name="description"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Description</FieldLabel>
            <Textarea {...field} id={field.name} rows={3} aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  );
}
