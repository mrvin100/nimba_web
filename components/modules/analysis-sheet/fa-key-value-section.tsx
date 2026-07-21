"use client";

import { useForm } from "react-hook-form";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useUpdateFaSection } from "./useAnalysisSheet";
import { KEY_VALUE_CONFIGS } from "./fa-section-config";
import type { FaSection } from "./schema";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function parseValues(json: string | null): Record<string, string> {
  if (!json) return {};
  try {
    return JSON.parse(json) as Record<string, string>;
  } catch {
    return {};
  }
}

/**
 * Editor of a KEY_VALUE section — a fixed list of labeled fields (cover
 * blocks, présentation du contrat), stored as one flat JSON object whose
 * field names the export prints with its own labels.
 */
export function FaKeyValueSection({
  caseId,
  section,
  locked,
}: Readonly<{ caseId: string; section: FaSection; locked: boolean }>) {
  const update = useUpdateFaSection(caseId);
  const fields = KEY_VALUE_CONFIGS[section.key] ?? [];
  const form = useForm<Record<string, string>>({
    values: Object.fromEntries(fields.map(({ field }) => [field, parseValues(section.contentJson)[field] ?? ""])),
  });

  if (fields.length === 0) {
    return <p className="text-sm text-muted-foreground">Éditeur non configuré pour cette section.</p>;
  }

  if (locked) {
    const values = parseValues(section.contentJson);
    return (
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {fields.map(({ field, label }) => (
          <div key={field}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{values[field] || "—"}</dd>
          </div>
        ))}
      </dl>
    );
  }

  function onSubmit(values: Record<string, string>) {
    update.mutate(
      { key: section.key, contentJson: JSON.stringify(values) },
      { onError: (error) => form.setError("root", { message: getErrorMessage(error) }) },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(({ field, label }) => (
          <Field key={field}>
            <FieldLabel htmlFor={`${section.key}-${field}`}>{label}</FieldLabel>
            <Input id={`${section.key}-${field}`} {...form.register(field)} />
          </Field>
        ))}
      </div>

      {form.formState.errors.root && (
        <Field data-invalid>
          <FieldError errors={[form.formState.errors.root]} />
        </Field>
      )}

      <div className="flex justify-end">
        <SubmitButton
          formState={{ isSubmitting: update.isPending, isDirty: form.formState.isDirty }}
          requireDirty
          pendingLabel="Enregistrement…"
          variant="outline"
        >
          Enregistrer
        </SubmitButton>
      </div>
    </form>
  );
}
