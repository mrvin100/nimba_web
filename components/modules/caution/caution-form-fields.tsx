"use client";

import { CAUTION_CIVILITIES, CAUTION_CURRENCIES, type CautionFieldDefinition } from "./schema";
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

interface CautionFieldInputProps {
  field: CautionFieldDefinition;
  value: string;
  onChange: (value: string) => void;
}

/** One field of the dynamic form. A currency or civility picks from a select, everything else is a typed input. */
export function CautionFieldInput({ field, value, onChange }: CautionFieldInputProps) {
  if (field.type === "CURRENCY") {
    return (
      <Select value={value || DEFAULT_CURRENCY} onValueChange={onChange}>
        <SelectTrigger id={field.key} className="w-full">
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
        <SelectTrigger id={field.key} className="w-full">
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
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <Field key={field.key}>
          <FieldLabel htmlFor={field.key}>{field.label}</FieldLabel>
          <CautionFieldInput field={field} value={valueFor(field, values)} onChange={(value) => onChange(field.key, value)} />
        </Field>
      ))}
    </div>
  );
}
