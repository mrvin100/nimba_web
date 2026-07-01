"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { ApiError } from "@/lib/api-error";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useSession, useUpdateProfile } from "./useIdentity";
import { DEPARTMENT_LABELS, updateProfileSchema, type UpdateProfileInput } from "./schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function initials(name: string | undefined): string {
  if (!name) return "–";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const ROLE_LABELS = { MANAGER: "Manager", MEMBER: "Membre" } as const;

export function ProfileView() {
  const { user, loading } = useSession();
  const updateProfile = useUpdateProfile();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: "" },
  });

  useEffect(() => {
    if (user) reset({ fullName: user.fullName });
  }, [user, reset]);

  async function onSubmit(values: UpdateProfileInput) {
    try {
      const updated = await updateProfile.mutateAsync(values);
      reset({ fullName: updated.fullName });
      toast.success("Profil mis à jour");
    } catch (error) {
      setError("root", {
        message: error instanceof ApiError ? error.message : "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  }

  if (loading) {
    return <Skeleton className="h-96 w-full max-w-lg" />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/">
          <ArrowLeft />
          Retour
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Vos informations personnelles et vos accès.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{user.email}</p>
              <p>Import de photo à venir.</p>
            </div>
          </div>

          <Separator />

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Controller
                control={control}
                name="fullName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nom complet</FieldLabel>
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              {errors.root && <FieldError errors={[errors.root]} />}
            </FieldGroup>
            <div className="mt-4 flex items-center gap-2">
              <Button type="submit" disabled={!isDirty || isSubmitting}>
                {isSubmitting ? "Enregistrement…" : "Enregistrer"}
              </Button>
              <Button type="button" variant="outline" disabled={!isDirty} onClick={() => reset({ fullName: user.fullName })}>
                Annuler
              </Button>
            </div>
          </form>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Accès</p>
            <div className="flex flex-wrap gap-1">
              {user.admin && <Badge>Administrateur</Badge>}
              {user.memberships.map((m) => (
                <Badge key={m.department} variant="outline">
                  {m.department} · {ROLE_LABELS[m.role]}
                </Badge>
              ))}
              {!user.admin && user.memberships.length === 0 && <span className="text-sm text-muted-foreground">—</span>}
            </div>
            {user.memberships.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {user.memberships.map((m) => DEPARTMENT_LABELS[m.department]).join(" · ")}
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Thème</p>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
