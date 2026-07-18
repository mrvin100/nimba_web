"use client";

import { useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useUpdateFaSection } from "./useAnalysisSheet";
import { FINANCIAL_SEEDS } from "./fa-section-config";
import type { FaFinancialContent, FaSection } from "./schema";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

function parseContent(section: FaSection): FaFinancialContent {
  const json = section.contentJson ?? section.defaultContentJson;
  if (json) {
    try {
      const parsed = JSON.parse(json) as FaFinancialContent;
      if (parsed.lines?.length) return { years: parsed.years ?? [], lines: parsed.lines, commentaire: parsed.commentaire };
    } catch {
      // fall through to the seed
    }
  }
  const seed = FINANCIAL_SEEDS[section.key] ?? [];
  const year = String(new Date().getFullYear() - 1);
  return { years: [year], lines: seed.map((label) => ({ label, values: [""] })) };
}

/**
 * Editor of a FINANCIAL section (bilan / compte de résultat) — the fixed
 * SYSCOHADA rubriques seeded from the real documents as rows, one column per
 * exercice (add/remove years), plus the commentaire under the table. Rubrique
 * labels stay editable so a dossier can add or drop a line like the real
 * analyses do.
 */
export function FaFinancialSection({
  caseId,
  section,
  locked,
}: Readonly<{ caseId: string; section: FaSection; locked: boolean }>) {
  const update = useUpdateFaSection(caseId);
  const form = useForm<FaFinancialContent>({ values: parseContent(section) });
  const years = form.watch("years") ?? [];
  const lines = form.watch("lines") ?? [];

  if (locked) {
    const content = parseContent(section);
    return (
      <div className="space-y-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rubrique</TableHead>
              {content.years.map((year, index) => (
                <TableHead key={index}>{year}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.lines.map((line, index) => (
              <TableRow key={index}>
                <TableCell>{line.label}</TableCell>
                {content.years.map((_, yearIndex) => (
                  <TableCell key={yearIndex}>{line.values[yearIndex]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {content.commentaire && <p className="whitespace-pre-wrap text-sm">{content.commentaire}</p>}
      </div>
    );
  }

  function setYears(next: string[]) {
    form.setValue("years", next, { shouldDirty: true });
  }

  function setLines(next: FaFinancialContent["lines"]) {
    form.setValue("lines", next, { shouldDirty: true });
  }

  function addYear() {
    setYears([...years, ""]);
    setLines(lines.map((line) => ({ ...line, values: [...line.values, ""] })));
  }

  function removeYear(index: number) {
    setYears(years.filter((_, i) => i !== index));
    setLines(lines.map((line) => ({ ...line, values: line.values.filter((_, i) => i !== index) })));
  }

  function onSubmit(values: FaFinancialContent) {
    const content: FaFinancialContent = {
      years: values.years,
      lines: values.lines,
      commentaire: values.commentaire || undefined,
    };
    update.mutate(
      { key: section.key, contentJson: JSON.stringify(content) },
      { onError: (error) => form.setError("root", { message: getErrorMessage(error) }) },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-3">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-56">Rubrique</TableHead>
              {years.map((year, yearIndex) => (
                <TableHead key={yearIndex} className="min-w-32">
                  <div className="flex items-center gap-1">
                    <Input
                      value={year}
                      placeholder="Exercice"
                      aria-label={`Exercice ${yearIndex + 1}`}
                      onChange={(event) => setYears(years.map((y, i) => (i === yearIndex ? event.target.value : y)))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Supprimer cet exercice"
                      onClick={() => removeYear(yearIndex)}
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
            {lines.map((line, lineIndex) => (
              <TableRow key={lineIndex}>
                <TableCell className="align-top">
                  <Input
                    value={line.label}
                    aria-label={`Rubrique ${lineIndex + 1}`}
                    onChange={(event) =>
                      setLines(lines.map((l, i) => (i === lineIndex ? { ...l, label: event.target.value } : l)))
                    }
                  />
                </TableCell>
                {years.map((_, yearIndex) => (
                  <TableCell key={yearIndex} className="align-top">
                    <Input
                      value={line.values[yearIndex] ?? ""}
                      aria-label={`Valeur ${yearIndex + 1} de la rubrique ${lineIndex + 1}`}
                      onChange={(event) =>
                        setLines(
                          lines.map((l, i) =>
                            i === lineIndex
                              ? { ...l, values: l.values.map((v, vi) => (vi === yearIndex ? event.target.value : v)) }
                              : l,
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
                    aria-label="Supprimer cette rubrique"
                    onClick={() => setLines(lines.filter((_, i) => i !== lineIndex))}
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setLines([...lines, { label: "", values: years.map(() => "") }])}
        >
          <Plus />
          Rubrique
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addYear}>
          <Plus />
          Exercice
        </Button>
      </div>

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
