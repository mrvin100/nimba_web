"use client";

import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCaseTypes } from "./useCreditCase";
import type { CaseFormInput, CaseType, ContractType, ProductType } from "./schema";

/** Encodes a (productType, contractType) pair into one Select item value. */
function caseTypeKey(productType: ProductType, contractType: ContractType | null): string {
  return `${productType}::${contractType ?? ""}`;
}

/**
 * The credit-case write form's fields, shared by the create and edit dialogs so
 * the two can never diverge (same fields, same validation, same layout). The
 * dossier type is a single selector over the backend's CaseTypePolicy registry
 * (GET /credit-cases/types) — it sets productType and contractType together, so
 * the form never has to hardcode which combinations are valid.
 */
export function CaseFormFields({ form }: { form: UseFormReturn<CaseFormInput> }) {
  const { control, setValue } = form;
  const { data: caseTypes, isPending: typesPending } = useCaseTypes();
  const [productType, contractType] = useWatch({ control, name: ["productType", "contractType"] });
  const selectedKey = caseTypeKey(productType, contractType ?? null);

  function onCaseTypeChange(value: string) {
    const type = caseTypes?.find((candidate) => caseTypeKey(candidate.productType, candidate.contractType) === value);
    if (!type) return;
    setValue("productType", type.productType, { shouldDirty: true, shouldValidate: true });
    setValue("contractType", type.contractType ?? undefined, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <>
      <Controller
        control={control}
        name="clientName"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Nom du client</FieldLabel>
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} autoComplete="off" />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Field data-invalid={!!form.formState.errors.contractType}>
        <FieldLabel htmlFor="caseType">Type de dossier</FieldLabel>
        <Select name="caseType" value={selectedKey} onValueChange={onCaseTypeChange} disabled={typesPending}>
          <SelectTrigger id="caseType" aria-invalid={!!form.formState.errors.contractType}>
            <SelectValue placeholder={typesPending ? "Chargement…" : "Choisir un type de dossier"} />
          </SelectTrigger>
          <SelectContent>
            {(caseTypes ?? []).map((type: CaseType) => (
              <SelectItem key={caseTypeKey(type.productType, type.contractType)} value={caseTypeKey(type.productType, type.contractType)}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.contractType && <FieldError errors={[form.formState.errors.contractType]} />}
      </Field>

      <Controller
        control={control}
        name="currency"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Devise</FieldLabel>
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="accountNumber"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>N° de compte du client</FieldLabel>
            <Input
              {...field}
              value={field.value ?? ""}
              id={field.name}
              aria-invalid={fieldState.invalid}
              autoComplete="off"
              placeholder="Imprimé sur les traités (optionnel)"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  );
}
