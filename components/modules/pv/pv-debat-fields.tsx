"use client";

import { Controller, useFieldArray, type Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { UpdatePvDraftInput } from "./schema";

/** The "débats du comité" table's fields — préoccupation / réponse / recommandation, typed by the DCM. */
export function PvDebatFields({ control }: { control: Control<UpdatePvDraftInput> }) {
  const debats = useFieldArray({ control, name: "debats" });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FieldLabel>Débats du comité</FieldLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => debats.append({ preoccupation: "", reponse: "", recommandation: "" })}
        >
          <Plus />
          Ajouter
        </Button>
      </div>

      {debats.fields.length === 0 && <p className="text-sm text-muted-foreground">Aucun débat consigné.</p>}

      {debats.fields.map((item, index) => (
        <div key={item.id} className="space-y-2 rounded-md border p-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Débat {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Supprimer ce débat"
              onClick={() => debats.remove(index)}
            >
              <Trash2 />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Controller
              control={control}
              name={`debats.${index}.preoccupation`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Préoccupation</FieldLabel>
                  <Textarea {...field} id={field.name} rows={3} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={control}
              name={`debats.${index}.reponse`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Réponse du gestionnaire</FieldLabel>
                  <Textarea {...field} id={field.name} rows={3} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={control}
              name={`debats.${index}.recommandation`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Recommandation</FieldLabel>
                  <Textarea {...field} id={field.name} rows={3} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
