"use client";

import { useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useUpdateFaSection } from "./useAnalysisSheet";
import type { FaFlexTableContent, FaSection } from "./schema";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

function parseContent(json: string | null): FaFlexTableContent {
  if (!json) return { columns: [], rows: [] };
  try {
    const parsed = JSON.parse(json) as FaFlexTableContent;
    return { columns: parsed.columns ?? [], rows: parsed.rows ?? [], narrative: parsed.narrative, commentaire: parsed.commentaire };
  } catch {
    return { columns: [], rows: [] };
  }
}

const DEFAULT_COLUMNS = ["DESIGNATION", "QUANTITE"];

/**
 * Editor of a FLEX_TABLE section — the analyst defines the column headers
 * themselves (the Pilier 3 hypothesis tables differ per dossier: désignation/
 * quantité on one, destinations × six columns on another), plus the intro
 * narrative and trailing commentaire. Managed with plain state through RHF's
 * values (columns and rows resize together).
 */
export function FaFlexTableSection({
  caseId,
  section,
  locked,
}: Readonly<{ caseId: string; section: FaSection; locked: boolean }>) {
  const update = useUpdateFaSection(caseId);
  const form = useForm<FaFlexTableContent>({
    values: {
      ...parseContent(section.contentJson ?? section.defaultContentJson),
    },
  });
  const columns = form.watch("columns") ?? [];
  const rows = form.watch("rows") ?? [];

  if (locked) {
    const content = parseContent(section.contentJson ?? section.defaultContentJson);
    return (
      <div className="space-y-3">
        {content.narrative && <p className="whitespace-pre-wrap text-sm">{content.narrative}</p>}
        {content.columns.length > 0 && content.rows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                {content.columns.map((column, index) => (
                  <TableHead key={index}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {content.columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>{row[colIndex]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun tableau renseigné.</p>
        )}
        {content.commentaire && <p className="whitespace-pre-wrap text-sm">{content.commentaire}</p>}
      </div>
    );
  }

  function setColumns(next: string[]) {
    form.setValue("columns", next, { shouldDirty: true });
  }

  function setRows(next: string[][]) {
    form.setValue("rows", next, { shouldDirty: true });
  }

  function addColumn() {
    setColumns([...columns, ""]);
    setRows(rows.map((row) => [...row, ""]));
  }

  function removeColumn(index: number) {
    setColumns(columns.filter((_, i) => i !== index));
    setRows(rows.map((row) => row.filter((_, i) => i !== index)));
  }

  function startTable() {
    setColumns(DEFAULT_COLUMNS);
    setRows([DEFAULT_COLUMNS.map(() => "")]);
  }

  function onSubmit(values: FaFlexTableContent) {
    const content: FaFlexTableContent = {
      narrative: values.narrative || undefined,
      columns: values.columns,
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
      <Textarea {...form.register("narrative")} rows={3} placeholder="Texte d'introduction de la section…" />

      {columns.length === 0 ? (
        <Button type="button" variant="outline" size="sm" onClick={startTable}>
          <Plus />
          Ajouter un tableau
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, colIndex) => (
                    <TableHead key={colIndex} className="min-w-36 align-top">
                      <div className="flex items-center gap-1">
                        <Input
                          value={column}
                          aria-label={`Colonne ${colIndex + 1}`}
                          onChange={(event) => setColumns(columns.map((c, i) => (i === colIndex ? event.target.value : c)))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Supprimer cette colonne"
                          onClick={() => removeColumn(colIndex)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex} className="align-top">
                        <Input
                          value={row[colIndex] ?? ""}
                          aria-label={`Ligne ${rowIndex + 1}, colonne ${colIndex + 1}`}
                          onChange={(event) =>
                            setRows(
                              rows.map((r, ri) =>
                                ri === rowIndex ? r.map((v, ci) => (ci === colIndex ? event.target.value : v)) : r,
                              ),
                            )
                          }
                        />
                      </TableCell>
                    ))}
                    <TableCell className="align-top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Supprimer cette ligne"
                        onClick={() => setRows(rows.filter((_, i) => i !== rowIndex))}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setRows([...rows, columns.map(() => "")])}>
              <Plus />
              Ligne
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addColumn}>
              <Plus />
              Colonne
            </Button>
          </div>
        </div>
      )}

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
