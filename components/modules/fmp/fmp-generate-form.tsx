"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useCreateFmp } from "./useFmp";
import { createFmpSchema, type CreateFmpInput } from "./schema";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/** The DCM's one-step FMP generation form — a pure extract, so there is nothing to draft or edit afterward. */
export function FmpGenerateForm({ caseId }: Readonly<{ caseId: string }>) {
  const create = useCreateFmp(caseId);
  const form = useForm<CreateFmpInput>({
    resolver: zodResolver(createFmpSchema),
    defaultValues: { numeroPret: "", garantieRef: "" },
  });

  function onSubmit(values: CreateFmpInput) {
    create.mutate(values, { onError: (error) => form.setError("root", { message: getErrorMessage(error) }) });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex items-end gap-3">
      <FieldGroup className="flex flex-1 flex-row gap-3">
        <Controller
          control={form.control}
          name="numeroPret"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="flex-1">
              <FieldLabel htmlFor={field.name}>N° de prêt</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="garantieRef"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="flex-1">
              <FieldLabel htmlFor={field.name}>Référence garantie (optionnel)</FieldLabel>
              <Input {...field} value={field.value ?? ""} id={field.name} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      {form.formState.errors.root && (
        <Field data-invalid>
          <FieldError errors={[form.formState.errors.root]} />
        </Field>
      )}
      <SubmitButton formState={{ isSubmitting: create.isPending }} pendingLabel="Génération…">
        <FileText />
        Générer la FMP
      </SubmitButton>
    </form>
  );
}
