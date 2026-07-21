"use client";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useUpdateFaSection } from "./useAnalysisSheet";
import { TABLE_CONFIGS, type TableConfig } from "./fa-section-config";
import type { FaSection, FaTableContent } from "./schema";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface TableFormValues {
  narrative: string;
  rows: Record<string, string>[];
  commentaire: string;
}

/**
 * Parses a TABLE section's stored JSON — tolerating the legacy « personnes
 * clés » shape (a bare array of rows) from before the full-structure editors.
 */
function parseContent(json: string | null): FaTableContent {
  if (!json) return { rows: [] };
  try {
    const parsed: unknown = JSON.parse(json);
    if (Array.isArray(parsed)) return { rows: parsed as Record<string, string>[] };
    return parsed as FaTableContent;
  } catch {
    return { rows: [] };
  }
}

function initialValues(section: FaSection, config: TableConfig): TableFormValues {
  const content = parseContent(section.contentJson ?? section.defaultContentJson);
  let rows = content.rows ?? [];
  if (rows.length === 0 && config.seedRows) {
    const firstField = config.columns[0].field;
    rows = config.seedRows.map((value) => ({ [firstField]: value }));
  }
  return {
    narrative: content.narrative ?? "",
    rows: rows.map((row) => Object.fromEntries(config.columns.map(({ field }) => [field, row[field] ?? ""]))),
    commentaire: content.commentaire ?? "",
  };
}

/**
 * Generic editor of every typed TABLE section — the columns come from
 * [TABLE_CONFIGS] (the frontend mirror of the export's column definitions),
 * with optional intro narrative, seeded first-column rubriques and the
 * trailing « Commentaire » the real documents put under almost every table.
 */
export function FaTableSection({
  caseId,
  section,
  locked,
}: Readonly<{ caseId: string; section: FaSection; locked: boolean }>) {
  const update = useUpdateFaSection(caseId);
  const config = TABLE_CONFIGS[section.key];
  const form = useForm<TableFormValues>({
    values: config ? initialValues(section, config) : { narrative: "", rows: [], commentaire: "" },
  });
  const rows = useFieldArray({ control: form.control, name: "rows" });

  if (!config) {
    return <p className="text-sm text-muted-foreground">Éditeur non configuré pour cette section.</p>;
  }

  if (locked) {
    const content = initialValues(section, config);
    return (
      <div className="space-y-3">
        {content.narrative && <p className="whitespace-pre-wrap text-sm">{content.narrative}</p>}
        {content.rows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                {config.columns.map(({ field, header }) => (
                  <TableHead key={field}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.rows.map((row, index) => (
                <TableRow key={index}>
                  {config.columns.map(({ field }) => (
                    <TableCell key={field}>{row[field]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune ligne renseignée.</p>
        )}
        {content.commentaire && <p className="whitespace-pre-wrap text-sm">{content.commentaire}</p>}
      </div>
    );
  }

  function onSubmit(values: TableFormValues) {
    const content: FaTableContent = {
      narrative: values.narrative || undefined,
      rows: values.rows,
      commentaire: values.commentaire || undefined,
    };
    update.mutate(
      { key: section.key, contentJson: JSON.stringify(content) },
      { onError: (error) => form.setError("root", { message: getErrorMessage(error) }) },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-3">
      {config.hasNarrative && (
        <Textarea {...form.register("narrative")} rows={3} placeholder="Texte d'introduction de la section…" />
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map(({ field, header }) => (
                <TableHead key={field}>{header}</TableHead>
              ))}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.fields.map((item, index) => (
              <TableRow key={item.id}>
                {config.columns.map(({ field }) => (
                  <TableCell key={field} className="align-top">
                    <Controller
                      control={form.control}
                      name={`rows.${index}.${field}`}
                      render={({ field: input }) => <Input {...input} aria-label={field} />}
                    />
                  </TableCell>
                ))}
                <TableCell className="align-top">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Supprimer cette ligne"
                    onClick={() => rows.remove(index)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => rows.append(Object.fromEntries(config.columns.map(({ field }) => [field, ""])))}
      >
        <Plus />
        Ajouter une ligne
      </Button>

      <Textarea {...form.register("commentaire")} rows={3} placeholder="Commentaire (imprimé sous le tableau)…" />

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
