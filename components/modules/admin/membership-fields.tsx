"use client";

import { Controller, type Control, type Path } from "react-hook-form";
import { DEPARTMENT_LABELS } from "@/components/modules/identity";
import { ROLE_CHOICES, type MembershipFieldsInput, type RoleChoice } from "./schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ROLE_LABELS: Record<RoleChoice, string> = {
  NONE: "Aucun",
  MEMBER: "Membre",
  MANAGER: "Manager",
};

const DEPARTMENT_FIELDS = [
  { name: "dri", label: `DRI : ${DEPARTMENT_LABELS.DRI}` },
  { name: "dcm", label: `DCM : ${DEPARTMENT_LABELS.DCM}` },
  { name: "drc", label: `DRC : ${DEPARTMENT_LABELS.DRC}` },
  { name: "comite", label: `Comité : ${DEPARTMENT_LABELS.COMITE}` },
] as const;

/**
 * Per-direction role radios (one choice per direction) plus the platform-admin
 * flag. Shared by the create-user dialog and the edit-role dialog so the two
 * can never diverge.
 */
export function MembershipFields<T extends MembershipFieldsInput>({ control }: Readonly<{ control: Control<T> }>) {
  return (
    <>
      {DEPARTMENT_FIELDS.map((dept) => (
        <Controller
          key={dept.name}
          control={control}
          name={dept.name as Path<T>}
          render={({ field }) => (
            <FieldSet>
              <FieldLegend variant="label">{dept.label}</FieldLegend>
              <RadioGroup
                value={field.value as string}
                onValueChange={field.onChange}
                className="grid-flow-col justify-start gap-6"
              >
                {ROLE_CHOICES.map((choice) => (
                  <Field key={choice} orientation="horizontal" className="w-auto">
                    <RadioGroupItem value={choice} id={`${dept.name}-${choice}`} />
                    <FieldLabel htmlFor={`${dept.name}-${choice}`} className="font-normal">
                      {ROLE_LABELS[choice]}
                    </FieldLabel>
                  </Field>
                ))}
              </RadioGroup>
            </FieldSet>
          )}
        />
      ))}

      <Controller
        control={control}
        name={"admin" as Path<T>}
        render={({ field }) => (
          <Field orientation="horizontal">
            <Checkbox
              id="admin"
              checked={field.value as boolean}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
            <FieldLabel htmlFor="admin">Administrateur de la plateforme</FieldLabel>
          </Field>
        )}
      />
    </>
  );
}
