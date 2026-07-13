"use client";

import { Controller, useFieldArray, type Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ConditionsDeBanqueInput } from "./schema";

const PERCENT_FIELDS = [
  { name: "tauxInteretPct", label: "Taux d'intérêt (%)" },
  { name: "fraisMiseEnPlacePct", label: "Frais de mise en place (%)" },
  { name: "comEngagementPct", label: "Commission d'engagement (%)" },
  { name: "fraisEtudesPct", label: "Frais d'études (%)" },
  { name: "valeurResiduellePct", label: "Valeur résiduelle (%)" },
] as const satisfies ReadonlyArray<{ name: keyof ConditionsDeBanqueInput; label: string }>;

/** The conditions-de-banque form's fields, shared by the edit dialog's single form. */
export function ConditionsDeBanqueFields({ control }: { control: Control<ConditionsDeBanqueInput> }) {
  const fraisDivers = useFieldArray({ control, name: "fraisDivers" });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PERCENT_FIELDS.map(({ name, label }) => (
          <Controller
            key={name}
            control={control}
            name={name}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <Input
                  type="number"
                  step="0.001"
                  min={0}
                  max={100}
                  value={field.value ?? ""}
                  onChange={(event) => field.onChange(event.target.value === "" ? undefined : event.target.value)}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <FieldLabel>Frais divers</FieldLabel>
          <Button type="button" variant="outline" size="sm" onClick={() => fraisDivers.append({ label: "", montant: 0 })}>
            <Plus />
            Ajouter
          </Button>
        </div>

        {fraisDivers.fields.length === 0 && <p className="text-sm text-muted-foreground">Aucun frais divers.</p>}

        {fraisDivers.fields.map((item, index) => (
          <div key={item.id} className="flex items-start gap-2">
            <Controller
              control={control}
              name={`fraisDivers.${index}.label`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="flex-1">
                  <Input {...field} placeholder="Libellé (ex. Notification)" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={control}
              name={`fraisDivers.${index}.montant`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="w-40">
                  <Input
                    type="number"
                    step="1"
                    min={0}
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(event.target.value)}
                    placeholder="Montant"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Supprimer ce frais"
              onClick={() => fraisDivers.remove(index)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
