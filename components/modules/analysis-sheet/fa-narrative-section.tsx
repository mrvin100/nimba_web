"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useUpdateFaSection } from "./useAnalysisSheet";
import { faSectionContentSchema, type FaSection, type FaSectionContentInput } from "./schema";
import { Field, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

/** A free-text section (e.g. proposition de décision, synthèse) — locked once the FA is published. */
export function FaNarrativeSection({
  caseId,
  section,
  locked,
}: Readonly<{ caseId: string; section: FaSection; locked: boolean }>) {
  const update = useUpdateFaSection(caseId);
  const form = useForm<FaSectionContentInput>({
    resolver: zodResolver(faSectionContentSchema),
    values: { contentJson: section.contentJson ?? "" },
  });

  if (locked) {
    return <p className="whitespace-pre-wrap text-sm">{section.contentJson || "Aucune note."}</p>;
  }

  function onSubmit(values: FaSectionContentInput) {
    update.mutate(
      { key: section.key, contentJson: values.contentJson ?? null },
      { onError: (error) => form.setError("root", { message: getErrorMessage(error) }) },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-3">
      <Textarea {...form.register("contentJson")} rows={5} placeholder="Rédigez cette section…" />
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
