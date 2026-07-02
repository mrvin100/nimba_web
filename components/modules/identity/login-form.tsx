"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api-error";
import { ROUTES } from "@/lib/constants";
import { PasswordInput } from "@/components/shared/password-input";
import { login, publicOrganizationLogoPath } from "./auth-service";
import { landingPath } from "./auth-access";
import { useBootstrapStatus, useOrganizationName, useSession } from "./useIdentity";
import { loginSchema, type LoginInput } from "./schema";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export function LoginForm() {
  const router = useRouter();
  const session = useSession();
  const bootstrap = useBootstrapStatus();
  const organization = useOrganizationName();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  // Already signed in? Don't show the login form — forward to the workspace. Only a
  // visitor without an active session should stay on this page.
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
      const message =
        error instanceof ApiError && error.status === 429
          ? "Trop de tentatives de connexion. Veuillez réessayer plus tard."
          : error instanceof ApiError && error.status === 401
            ? "Identifiants invalides."
            : "Une erreur est survenue. Veuillez réessayer.";
      setError("root", { message });
    }
  }

  // While the session resolves, or once we know the visitor is signed in and are
  // redirecting, show a spinner rather than briefly flashing the credentials form.
  if (session.loading || session.user) {
    return (
      <div className="flex min-h-40 items-center justify-center" aria-busy>
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input id="email" type="email" autoComplete="username" aria-invalid={!!errors.email} {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          <SubmitButton formState={{ isSubmitting }} className="w-full" pendingLabel="Connexion…">
            Se connecter
          </SubmitButton>
          {bootstrap.data?.available ? (
            <p className="text-center text-xs text-muted-foreground">
              Première installation ?{" "}
              <Link href={ROUTES.BOOTSTRAP} className="underline underline-offset-4">
                Initialiser l&apos;administrateur
              </Link>
            </p>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Pas d&apos;accès ou un problème de connexion ? Contactez la DSI (administration).
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
