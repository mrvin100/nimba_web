"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { ApiError } from "@/lib/api-error";
import { DEPARTMENT_LABELS } from "@/components/modules/identity";
import { useCreateUser } from "./useAdmin";
import {
  createUserSchema,
  hasAnyAssignment,
  toCreateUserPayload,
  type CreateUserInput,
  type RoleChoice,
} from "./schema";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLE_LABELS: Record<RoleChoice, string> = {
  NONE: "Aucun",
  MEMBER: "Membre",
  MANAGER: "Manager",
};

const DEPARTMENT_FIELDS = [
  { name: "dri", label: `DRI — ${DEPARTMENT_LABELS.DRI}` },
  { name: "dcm", label: `DCM — ${DEPARTMENT_LABELS.DCM}` },
  { name: "drc", label: `DRC — ${DEPARTMENT_LABELS.DRC}` },
] as const;

const DEFAULTS: CreateUserInput = {
  fullName: "",
  email: "",
  admin: false,
  dri: "NONE",
  dcm: "NONE",
  drc: "NONE",
};

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const createUser = useCreateUser();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({ resolver: zodResolver(createUserSchema), defaultValues: DEFAULTS });

  async function onSubmit(values: CreateUserInput) {
    if (!hasAnyAssignment(values)) {
      setError("root", { message: "Attribuez au moins une direction ou le rôle administrateur." });
      return;
    }
    try {
      const created = await createUser.mutateAsync(toCreateUserPayload(values));
      toast.success(`Invitation envoyée à ${created.email}`);
      setOpen(false);
      reset(DEFAULTS);
    } catch (error) {
      setError("root", {
        message: error instanceof ApiError ? error.message : "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nouvel utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvel utilisateur</DialogTitle>
          <DialogDescription>
            Créez un compte et attribuez ses accès. Un e-mail d&apos;invitation lui permettra de définir son mot de passe.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={control}
              name="fullName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nom complet</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} autoComplete="off" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Adresse e-mail</FieldLabel>
                  <Input {...field} id={field.name} type="email" aria-invalid={fieldState.invalid} autoComplete="off" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {DEPARTMENT_FIELDS.map((dept) => (
              <Controller
                key={dept.name}
                control={control}
                name={dept.name}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <FieldLabel htmlFor={field.name}>{dept.label}</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(ROLE_LABELS) as RoleChoice[]).map((choice) => (
                          <SelectItem key={choice} value={choice}>
                            {ROLE_LABELS[choice]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            ))}

            <Controller
              control={control}
              name="admin"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                  <FieldLabel htmlFor={field.name}>Administrateur de la plateforme</FieldLabel>
                </Field>
              )}
            />

            {errors.root && <FieldError errors={[errors.root]} />}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <SubmitButton formState={{ isSubmitting }} pendingLabel="Création…">
              Créer l'utilisateur
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
