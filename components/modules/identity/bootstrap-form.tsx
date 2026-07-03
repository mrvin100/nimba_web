"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "@/lib/api-error";
import { ROUTES } from "@/lib/constants";
import { useBootstrap, useBootstrapStatus } from "./useIdentity";
import { bootstrapSchema, type BootstrapInput } from "./schema";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * First-run screen: creates the initial platform administrator. The backend
 * self-disables this once an admin exists, so a returning visitor sees a notice
 * instead of the form.
 */
export function BootstrapForm() {
  const router = useRouter();
  const status = useBootstrapStatus();
  const createAdmin = useBootstrap();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BootstrapInput>({
    resolver: zodResolver(bootstrapSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  function onSubmit(values: BootstrapInput) {
    createAdmin.mutate(values, {
      onSuccess: () => router.replace(ROUTES.LOGIN),
      onError: (error) => setError("root", { message: getErrorMessage(error) }),
    });
  }

  if (status.isPending) {
    return <Skeleton className="h-64 w-full max-w-sm" />;
  }

  if (status.isError || !status.data?.available) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Initialisation déjà effectuée</CardTitle>
          <CardDescription>Un administrateur existe déjà pour cette plateforme.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href={ROUTES.LOGIN}>Aller à la connexion</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Initialisation</CardTitle>
        <CardDescription>Créez le premier administrateur de la plateforme.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={control}
              name="fullName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nom complet</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} autoComplete="name" />
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
                  <Input {...field} id={field.name} type="email" aria-invalid={fieldState.invalid} autoComplete="username" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Mot de passe</FieldLabel>
                  <PasswordInput {...field} id={field.name} aria-invalid={fieldState.invalid} autoComplete="new-password" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            {errors.root && <FieldError errors={[errors.root]} />}
          </FieldGroup>
          <SubmitButton formState={{ isSubmitting: createAdmin.isPending }} className="mt-6 w-full" pendingLabel="Création…">
            Créer l'administrateur
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
