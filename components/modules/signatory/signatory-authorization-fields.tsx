"use client";

import { Controller, type Control } from "react-hook-form";
import { DEPARTMENTS, DEPARTMENT_ROLES, type Department, type DepartmentRole } from "@/components/modules/identity";
import type { SignatoryAuthorization, SignatoryInput } from "./schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";

const ROLE_LABELS: Record<DepartmentRole, string> = { MANAGER: "Manager", MEMBER: "Membre" };

function has(list: SignatoryAuthorization[], department: Department, departmentRole: DepartmentRole): boolean {
  return list.some((a) => a.department === department && a.departmentRole === departmentRole);
}

function toggled(
  list: SignatoryAuthorization[],
  department: Department,
  departmentRole: DepartmentRole,
  checked: boolean,
): SignatoryAuthorization[] {
  if (checked) return [...list, { department, departmentRole }];
  return list.filter((a) => !(a.department === department && a.departmentRole === departmentRole));
}

/** Restricts who may pick this signatory to specific direction+role holders; none checked = usable by anyone. */
export function SignatoryAuthorizationFields({ control }: Readonly<{ control: Control<SignatoryInput> }>) {
  return (
    <Controller
      control={control}
      name="authorizations"
      render={({ field }) => (
        <FieldSet>
          <FieldLegend variant="label">Restriction (facultatif)</FieldLegend>
          <FieldDescription>
            Aucune case cochée : utilisable par tout le monde. Sinon, seuls les rôles cochés peuvent choisir ce signataire.
          </FieldDescription>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
            {DEPARTMENTS.flatMap((department) =>
              DEPARTMENT_ROLES.map((departmentRole) => {
                const id = `authz-${department}-${departmentRole}`;
                return (
                  <Field key={id} orientation="horizontal" className="w-auto">
                    <Checkbox
                      id={id}
                      checked={has(field.value, department, departmentRole)}
                      onCheckedChange={(checked) => field.onChange(toggled(field.value, department, departmentRole, checked === true))}
                    />
                    <FieldLabel htmlFor={id} className="font-normal">
                      {department} {ROLE_LABELS[departmentRole]}
                    </FieldLabel>
                  </Field>
                );
              }),
            )}
          </div>
        </FieldSet>
      )}
    />
  );
}
