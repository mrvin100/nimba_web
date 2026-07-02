"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";
import { ROUTES } from "@/lib/constants";
import { useInvitation, useSetPassword } from "./useIdentity";
import { setPasswordSchema, type SetPasswordInput } from "./schema";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/shared/password-input";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Activates an invited account: validates the token, then lets the user choose a
 * password. An invalid/expired token shows a notice rather than the form.
 */
export function SetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const invitation = useInvitation(token);
  const setPassword = useSetPassword();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  async function onSubmit(values: SetPasswordInput) {
    try {
      await setPassword.mutateAsync({ token, password: values.password });
      toast.success("Mot de passe défini. Vous pouvez vous connecter.");
      router.replace(ROUTES.LOGIN);
    } catch (error) {
      setError("root", { message: getErrorMessage(error, "Une erreur est survenue. Veuillez réessayer.") });
    }
  }

  if (invitation.isPending) {
    return <Skeleton className="h-64 w-full max-w-sm" />;
  }

  if (invitation.isError || !invitation.data) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Invitation invalide</CardTitle>
          <CardDescription>Ce lien a expiré ou a déjà été utilisé.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href={ROUTES.LOGIN}>Aller à la connexion</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Définir votre mot de passe</CardTitle>
        <CardDescription>{invitation.data.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
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
            <Controller
              control={control}
              name="confirm"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Confirmer le mot de passe</FieldLabel>
                  <PasswordInput {...field} id={field.name} aria-invalid={fieldState.invalid} autoComplete="new-password" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            {errors.root && <FieldError errors={[errors.root]} />}
          </FieldGroup>
          <SubmitButton formState={{ isSubmitting }} className="mt-6 w-full" pendingLabel="Enregistrement…">
            Définir le mot de passe
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
