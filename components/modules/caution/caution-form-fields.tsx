"use client";

import { useState } from "react";
import { addDays, format, isValid, parseISO } from "date-fns";
import { CAUTION_CIVILITIES, CAUTION_CURRENCIES, type CautionFieldDefinition } from "./schema";
import { RequiredMark } from "./required-mark";
import { Field, FieldLabel } from "@/components/ui/field";
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

/** A field's value as it will be submitted. A currency field defaults to GNF even if the operator never opened the select. */
export function valueFor(field: CautionFieldDefinition, values: Record<string, string>): string {
  if (values[field.key] !== undefined) return values[field.key];
  return field.type === "CURRENCY" ? DEFAULT_CURRENCY : "";
}

/** Whether a field still needs a value before the form can be submitted (optional fields never block). */
export function isFieldSatisfied(field: CautionFieldDefinition, values: Record<string, string>): boolean {
  return field.optional || valueFor(field, values).trim().length > 0;
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
}: {
  fieldKey: string;
  baseDate: string;
  value: string;
  onChange: (value: string) => void;
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

interface CautionFieldInputProps {
  field: CautionFieldDefinition;
  value: string;
  onChange: (value: string) => void;
  /** The dateOffre value, only passed when rendering dateExpiration (their computed-duration pairing). */
  baseDateForDuration?: string;
}

/** One field of the dynamic form. A currency or civility picks from a select, everything else is a typed input. */
export function CautionFieldInput({ field, value, onChange, baseDateForDuration }: CautionFieldInputProps) {
  const required = !field.optional;
  if (field.key === "dateExpiration" && baseDateForDuration !== undefined) {
    return <DateWithDurationInput fieldKey={field.key} baseDate={baseDateForDuration} value={value} onChange={onChange} />;
  }
  if (field.type === "CURRENCY") {
    return (
      <Select value={value || DEFAULT_CURRENCY} onValueChange={onChange}>
        <SelectTrigger id={field.key} className="w-full" aria-required={required}>
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
        <SelectTrigger id={field.key} className="w-full" aria-required={required}>
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
      aria-required={required}
    />
  );
}

interface CautionFieldsGridProps {
  fields: CautionFieldDefinition[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

/** Renders a set of fields in a responsive two-column grid (single column on narrow screens) for a compact, scannable form. */
export function CautionFieldsGrid({ fields, values, onChange }: CautionFieldsGridProps) {
  const hasDateOffre = fields.some((field) => field.key === "dateOffre");
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <Field key={field.key} className={field.key === "dateExpiration" && hasDateOffre ? "sm:col-span-2" : undefined}>
          <FieldLabel htmlFor={field.key}>
            {field.label}
            {!field.optional && <RequiredMark />}
          </FieldLabel>
          <CautionFieldInput
            field={field}
            value={valueFor(field, values)}
            onChange={(value) => onChange(field.key, value)}
            baseDateForDuration={field.key === "dateExpiration" && hasDateOffre ? (values.dateOffre ?? "") : undefined}
          />
        </Field>
      ))}
    </div>
  );
}
