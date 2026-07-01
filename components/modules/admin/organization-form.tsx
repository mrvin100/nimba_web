"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-error";
import { useOrganization, useUpdateOrganization } from "./useAdmin";
import { organizationSchema, type OrganizationInput } from "./schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

/** Organisation settings form: name and the invitation e-mail sender identity. */
export function OrganizationForm() {
  const { data, isPending, isError } = useOrganization();
  const update = useUpdateOrganization();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<OrganizationInput>({
    resolver: zodResolver(organizationSchema),
    defaultValues: { organizationName: "", senderName: "", senderEmail: "" },
  });

  useEffect(() => {
    if (data) {
      reset({ organizationName: data.organizationName, senderName: data.senderName, senderEmail: data.senderEmail });
    }
  }, [data, reset]);

  async function onSubmit(values: OrganizationInput) {
    try {
      await update.mutateAsync(values);
      reset(values);
      toast.success("Paramètres enregistrés");
    } catch (error) {
      setError("root", {
        message: error instanceof ApiError ? error.message : "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  }

  if (isPending) {
    return <Skeleton className="h-64 w-full max-w-lg" />;
  }

  if (isError) {
    return <p className="text-sm text-destructive">Impossible de charger les paramètres. Veuillez réessayer.</p>;
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Organisation</CardTitle>
        <CardDescription>Identité de l&apos;organisation et expéditeur des e-mails d&apos;invitation.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={control}
              name="organizationName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nom de l&apos;organisation</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="senderName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nom de l&apos;expéditeur</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="senderEmail"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Adresse e-mail expéditeur</FieldLabel>
                  <Input {...field} id={field.name} type="email" aria-invalid={fieldState.invalid} />
                  <FieldDescription>Ex. no-reply@nimba.com</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            {errors.root && <FieldError errors={[errors.root]} />}
          </FieldGroup>
          <div className="mt-6 flex items-center gap-2">
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Button type="button" variant="outline" disabled={!isDirty} onClick={() => data && reset(data)}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
