"use client";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useUpdateFaSection } from "./useAnalysisSheet";
import { personnesClesSchema, type FaSection, type PersonneCle, type PersonnesClesInput } from "./schema";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function parsePersonnes(contentJson: string | null): PersonneCle[] {
  return contentJson ? (JSON.parse(contentJson) as PersonneCle[]) : [];
}

/** The "1.6 Personnes clés" proof TABLE section — a repeatable nom/fonction list, opaque JSON on the backend. */
export function FaPersonnesClesSection({
  caseId,
  section,
  locked,
}: Readonly<{ caseId: string; section: FaSection; locked: boolean }>) {
  const update = useUpdateFaSection(caseId);
  const form = useForm<PersonnesClesInput>({
    resolver: zodResolver(personnesClesSchema),
    values: { personnes: parsePersonnes(section.contentJson) },
  });
  const personnes = useFieldArray({ control: form.control, name: "personnes" });

  const rows = locked ? parsePersonnes(section.contentJson) : null;

  if (locked) {
    return rows && rows.length > 0 ? (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Fonction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((personne, index) => (
            <TableRow key={index}>
              <TableCell>{personne.nom}</TableCell>
              <TableCell>{personne.fonction}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : (
      <p className="text-sm text-muted-foreground">Aucune personne clé renseignée.</p>
    );
  }

  function onSubmit(values: PersonnesClesInput) {
    update.mutate(
      { key: section.key, contentJson: JSON.stringify(values.personnes) },
      { onError: (error) => form.setError("root", { message: getErrorMessage(error) }) },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Nom et fonction des personnes clés de l&apos;entreprise.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => personnes.append({ nom: "", fonction: "" })}>
          <Plus />
          Ajouter
        </Button>
      </div>

      {personnes.fields.length === 0 && <p className="text-sm text-muted-foreground">Aucune personne clé.</p>}

      {personnes.fields.map((item, index) => (
        <div key={item.id} className="flex items-start gap-2">
          <Controller
            control={form.control}
            name={`personnes.${index}.nom`}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <Input {...field} placeholder="Nom" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name={`personnes.${index}.fonction`}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <Input {...field} placeholder="Fonction" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Supprimer cette personne"
            onClick={() => personnes.remove(index)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}

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
