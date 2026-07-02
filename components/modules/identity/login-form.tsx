"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api-error";
import { ROUTES } from "@/lib/constants";
import { PasswordInput } from "@/components/shared/password-input";
import { SubmitButton } from "@/components/shared/submit-button";
import { login, publicOrganizationLogoPath } from "./auth-service";
import { landingPath } from "./auth-access";
import { useBootstrapStatus, useOrganizationName, useSession } from "./useIdentity";
import { loginSchema, type LoginInput } from "./schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

/** Maps a login failure to the message shown under the form. */
function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 429) {
    return "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
  }
  if (error instanceof ApiError && error.status === 401) {
    return "Identifiants invalides.";
  }
  return "Une erreur est survenue. Veuillez réessayer.";
}

export function LoginForm() {
  const router = useRouter();
  const session = useSession();
  const bootstrap = useBootstrapStatus();
  const organization = useOrganizationName();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // A signed-in visitor never sees the credentials form: forward straight to
  // their board (redirect is a side effect, so it lives in an effect).
  useEffect(() => {
    if (!session.loading && session.user) {
      router.replace(landingPath(session.user));
    }
  }, [session.loading, session.user, router]);

  async function onSubmit(values: LoginInput) {
    try {
      const user = await login(values);
      router.replace(landingPath(user));
      router.refresh();
    } catch (error) {
      form.setError("root", { message: loginErrorMessage(error) });
    }
  }
  
  if (session.loading || session.user) {
    return (
      <div className="flex min-h-40 items-center justify-center" aria-busy>
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
    <Card className="w-full max-w-sm">
      <CardHeader>
        {organization.data?.hasLogo && (
          // eslint-disable-next-line @next/next/no-img-element -- backend-served binary, not a static asset
          <img
            src={publicOrganizationLogoPath()}
            alt={organization.data.organizationName}
            className="mb-2 h-12 w-auto self-start object-contain"
          />
        )}
        <CardTitle>Connexion</CardTitle>
        <CardDescription>{organization.data?.organizationName ?? "Nimba"}</CardDescription>
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
          <SubmitButton formState={form.formState} className="mt-6 w-full" pendingLabel="Connexion…">
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
    </div>
  );
}
