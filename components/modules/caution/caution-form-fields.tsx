"use client";

import { useState } from "react";
import { Controller, useWatch, type Control, type FieldValues, type Path } from "react-hook-form";
import { addDays, format, isValid, parseISO } from "date-fns";
import { CAUTION_CIVILITIES, CAUTION_CURRENCIES, type CautionFieldDefinition } from "./schema";
import { RequiredMark } from "./required-mark";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const DEFAULT_CURRENCY = "GNF";

/** The select value used to represent "no civility" (Radix Select forbids an empty-string item value). */
const NO_CIVILITY = "__none__";

function fieldInputType(type: CautionFieldDefinition["type"]): string {
  if (type === "DATE") return "date";
  if (type === "AMOUNT") return "number";
  return "text";
}

/** A field's seed value for the form's default values — a currency field defaults to GNF even if the operator never opens the select. */
export function defaultValueFor(field: CautionFieldDefinition, content: Record<string, string> | undefined): string {
  if (content?.[field.key] !== undefined) return content[field.key];
  return field.type === "CURRENCY" ? DEFAULT_CURRENCY : "";
}

/**
 * A date that can also be set as "N jours après" another date field, instead
 * of always picking the date directly — the two-way relationship the real
 * SMS document has between dateOffre and dateExpiration (often a fixed 90/120/180
 * day validity period). Entering a day count computes and fills the date;
 * picking the date directly works exactly as before and simply clears the
 * day count (they are two entry paths to the same single stored value, not
 * two fields).
 */
function DateWithDurationInput({
  fieldKey,
  baseDate,
  value,
  onChange,
  invalid,
}: {
  fieldKey: string;
  baseDate: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  const [days, setDays] = useState("");

  function applyDays(rawDays: string) {
    setDays(rawDays);
    const parsedBase = parseISO(baseDate);
    const count = Number(rawDays);
    if (rawDays.trim() && baseDate && isValid(parsedBase) && Number.isFinite(count)) {
      onChange(format(addDays(parsedBase, count), "yyyy-MM-dd"));
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        id={fieldKey}
        type="date"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setDays("");
        }}
        aria-required
        aria-invalid={invalid}
        className="flex-1"
      />
      <span className="shrink-0 text-xs text-muted-foreground">ou</span>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="Nb jours"
        value={days}
        onChange={(event) => applyDays(event.target.value)}
        disabled={!baseDate}
        title={baseDate ? undefined : "Renseignez d'abord la date de l'offre"}
        className="w-24 shrink-0"
      />
    </div>
  );
}

/** The select value used to represent "no lot" (Radix Select forbids an empty-string item value). */
const NO_LOT = "__none__";

/** The lots the dossier declared, in the order they were entered. */
export function parseLots(lots: string | undefined): string[] {
  return (lots ?? "")
    .split(",")
    .map((lot) => lot.trim())
    .filter((lot) => lot.length > 0);
}

interface CautionFieldInputProps {
  field: CautionFieldDefinition;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  /** The dateOffre value, only passed when rendering dateExpiration (their computed-duration pairing). */
  baseDateForDuration?: string;
  /** The lots declared on the dossier, only passed when rendering a LOT field. */
  lotChoices?: string[];
}

/** One field of the dynamic form. A currency, civility or lot picks from a select, everything else is a typed input. */
export function CautionFieldInput({ field, value, onChange, onBlur, invalid, baseDateForDuration, lotChoices }: CautionFieldInputProps) {
  const required = !field.optional;
  if (field.key === "dateExpiration" && baseDateForDuration !== undefined) {
    return <DateWithDurationInput fieldKey={field.key} baseDate={baseDateForDuration} value={value} onChange={onChange} invalid={invalid} />;
  }
  if (field.type === "LOT") {
    return (
      <Select value={value || NO_LOT} onValueChange={(next) => onChange(next === NO_LOT ? "" : next)}>
        <SelectTrigger id={field.key} className="w-full" aria-required={required} aria-invalid={invalid}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_LOT}>Aucun (demande mono-lot)</SelectItem>
          {(lotChoices ?? []).map((lot) => (
            <SelectItem key={lot} value={lot}>
              {lot}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (field.type === "CURRENCY") {
    return (
      <Select value={value || DEFAULT_CURRENCY} onValueChange={onChange}>
        <SelectTrigger id={field.key} className="w-full" aria-required={required} aria-invalid={invalid}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CAUTION_CURRENCIES.map((currency) => (
            <SelectItem key={currency} value={currency}>
              {currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (field.type === "CIVILITY") {
    return (
      <Select value={value || NO_CIVILITY} onValueChange={(next) => onChange(next === NO_CIVILITY ? "" : next)}>
        <SelectTrigger id={field.key} className="w-full" aria-required={required} aria-invalid={invalid}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_CIVILITY}>Aucune</SelectItem>
          {CAUTION_CIVILITIES.map((civility) => (
            <SelectItem key={civility} value={civility}>
              {civility}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  return (
    <Input
      id={field.key}
      type={fieldInputType(field.type)}
      inputMode={field.type === "AMOUNT" ? "numeric" : undefined}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      aria-required={required}
      aria-invalid={invalid}
    />
  );
}

interface CautionFieldsGridProps<T extends FieldValues> {
  fields: CautionFieldDefinition[];
  control: Control<T>;
  /** Maps a field's key to its path in the form (e.g. `content.${key}`). */
  pathFor: (key: string) => Path<T>;
  /** The lots declared on the dossier, offered by the LOT field's select. */
  lotChoices?: string[];
}

/** Renders a set of fields in a responsive two-column grid (single column on narrow screens), each wired to react-hook-form with accessible validation feedback (label "*", aria-invalid, inline error). */
export function CautionFieldsGrid<T extends FieldValues>({ fields, control, pathFor, lotChoices }: CautionFieldsGridProps<T>) {
  const hasDateOffre = fields.some((field) => field.key === "dateOffre");
  // Watching a path outside this grid's own fields (when it has no dateOffre) is harmless — RHF just reports it as undefined.
  const dateOffre = useWatch({ control, name: pathFor("dateOffre") }) as string | undefined;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <Controller
          key={field.key}
          control={control}
          name={pathFor(field.key)}
          render={({ field: controllerField, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className={field.key === "dateExpiration" && hasDateOffre ? "sm:col-span-2" : undefined}>
              <FieldLabel htmlFor={field.key}>
                {field.label}
                {!field.optional && <RequiredMark />}
              </FieldLabel>
              <CautionFieldInput
                field={field}
                value={(controllerField.value as string | undefined) ?? ""}
                onChange={controllerField.onChange}
                onBlur={controllerField.onBlur}
                invalid={fieldState.invalid}
                baseDateForDuration={field.key === "dateExpiration" && hasDateOffre ? (dateOffre ?? "") : undefined}
                lotChoices={lotChoices}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      ))}
    </div>
  );
}
