"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "@/lib/api-error";
import { useOrganization, useUpdateOrganization } from "./useAdmin";
import { organizationSchema, type OrganizationInput, type OrganizationSettings } from "./schema";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/** Maps the server's nullable fields to the form's (blank instead of null). */
function toFormValues(settings: OrganizationSettings): OrganizationInput {
  return {
    organizationName: settings.organizationName,
    senderName: settings.senderName,
    senderEmail: settings.senderEmail,
    signataire1Nom: settings.signataire1Nom ?? "",
    signataire1Titre: settings.signataire1Titre ?? "",
    signataire2Nom: settings.signataire2Nom ?? "",
    signataire2Titre: settings.signataire2Titre ?? "",
  };
}

/** Organisation settings form: name, the invitation e-mail sender identity, and the standing signatories printed on generated legal documents. */
export function OrganizationForm() {
  const { data, isPending, isError } = useOrganization();
  const update = useUpdateOrganization();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<OrganizationInput>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      organizationName: "",
      senderName: "",
      senderEmail: "",
      signataire1Nom: "",
      signataire1Titre: "",
      signataire2Nom: "",
      signataire2Titre: "",
    },
  });

  useEffect(() => {
    if (data) {
      reset(toFormValues(data));
    }
  }, [data, reset]);

  function onSubmit(values: OrganizationInput) {
    update.mutate(values, {
      onSuccess: () => reset(values),
      onError: (error) => setError("root", { message: getErrorMessage(error) }),
    });
  }

  if (isPending) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (isError) {
    return <p className="text-sm text-destructive">Impossible de charger les paramètres. Veuillez réessayer.</p>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Identité &amp; expéditeur</CardTitle>
        <CardDescription>Nom de l&apos;organisation et expéditeur des e-mails d&apos;invitation.</CardDescription>
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
                  <FieldDescription>Ex. no-reply@dmba.com</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Separator className="my-2" />
            <FieldDescription>
              Signataires standards imprimés sur les documents générés (cautions, attestations...).
            </FieldDescription>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={control}
                name="signataire1Nom"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Signataire 1 — Nom</FieldLabel>
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="signataire1Titre"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Signataire 1 — Titre</FieldLabel>
                    <Input {...field} id={field.name} placeholder="Directeur Crédit Marketing" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={control}
                name="signataire2Nom"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Signataire 2 — Nom</FieldLabel>
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="signataire2Titre"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Signataire 2 — Titre</FieldLabel>
                    <Input {...field} id={field.name} placeholder="Directrice Générale Adjointe" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            {errors.root && <FieldError errors={[errors.root]} />}
          </FieldGroup>
          <div className="mt-6 flex items-center gap-2">
            <SubmitButton formState={{ isSubmitting: update.isPending, isDirty }} requireDirty pendingLabel="Enregistrement…">
              Enregistrer
            </SubmitButton>
            <Button type="button" variant="outline" disabled={!isDirty} onClick={() => data && reset(toFormValues(data))}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
