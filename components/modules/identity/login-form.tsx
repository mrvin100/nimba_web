"use client";

import Image from "next/image";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "@/lib/api-error";
import { ROUTES } from "@/lib/constants";
import { PasswordInput } from "@/components/shared/password-input";
import { SubmitButton } from "@/components/shared/submit-button";
import { publicOrganizationLogoPath } from "./identity.service";
import { useBootstrapStatus, useLogin, useOrganizationName } from "./useIdentity";
import { loginSchema, type LoginInput } from "./schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

/**
 * Credentials form — UI and validation only. The session redirect for an
 * already-signed-in visitor is handled once by <GuestOnly> in the (auth)
 * layout; the post-login navigation and cache priming live in useLogin.
 */
export function LoginForm() {
  const signIn = useLogin();
  const bootstrap = useBootstrapStatus();
  const organization = useOrganizationName();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    signIn.mutate(values, {
      onError: (error) => form.setError("root", { message: getErrorMessage(error) }),
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        {organization.data?.hasLogo && (
          <Image
            src={publicOrganizationLogoPath()}
            alt={organization.data.organizationName}
            width={160}
            height={48}
            unoptimized
            className="mb-2 h-8 w-auto self-start object-fit mx-auto"
          />
        )}
        <Separator className="my-2" />
        <div className="flex gap-2 justify-between">
          <CardTitle className="text-center flex">Connexion</CardTitle>
          <CardDescription className="text-center flex">{organization.data?.organizationName ?? "D'mba"}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Adresse e-mail</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    autoComplete="username"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Mot de passe</FieldLabel>
                  <PasswordInput
                    {...field}
                    id={field.name}
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            {form.formState.errors.root && (
              <Field data-invalid>
                <FieldError errors={[form.formState.errors.root]} />
              </Field>
            )}
          </FieldGroup>
          <SubmitButton formState={{ isSubmitting: signIn.isPending }} className="mt-6 w-full" pendingLabel="Connexion…">
            Se connecter
          </SubmitButton>
          {bootstrap.data?.available ? (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Première installation ?{" "}
              <Link href={ROUTES.BOOTSTRAP} className="underline underline-offset-4">
                Initialiser l&apos;administrateur
              </Link>
            </p>
          ) : (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Pas d&apos;accès ou un problème de connexion ? Contactez la DSI (administration).
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
