"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Trash2 } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useDeleteAvatar, useSession, useUpdateProfile, useUploadAvatar } from "./useIdentity";
import { avatarPath } from "./identity.service";
import { CIVILITIES, CIVILITY_LABELS, DEPARTMENT_LABELS, updateProfileSchema, type UpdateProfileInput } from "./schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { initials } from "@/lib/format";

const ROLE_LABELS = { MANAGER: "Manager", MEMBER: "Membre" } as const;

export function ProfileView() {
  const { user, loading } = useSession();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useDeleteAvatar();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarVersion, setAvatarVersion] = useState(0);

  // Feedback (toasts) and cache refresh live in the hooks; the view only wires
  // UI concerns — here the cache-busting version for the <img> URL.
  function onPickAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    uploadAvatar.mutate(file, { onSuccess: () => setAvatarVersion(Date.now()) });
  }

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: "", titre: "", civility: undefined, signatoryOptIn: false },
  });

  useEffect(() => {
    if (user) {
      reset({ fullName: user.fullName, titre: user.titre ?? "", civility: user.civility ?? undefined, signatoryOptIn: user.signatoryOptIn });
    }
  }, [user, reset]);

  function onSubmit(values: UpdateProfileInput) {
    updateProfile.mutate(values, {
      onSuccess: (updated) =>
        reset({
          fullName: updated.fullName,
          titre: updated.titre ?? "",
          civility: updated.civility ?? undefined,
          signatoryOptIn: updated.signatoryOptIn,
        }),
      onError: (error) => setError("root", { message: getErrorMessage(error) }),
    });
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Vos informations personnelles et vos accès.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {user.hasAvatar && (
                <AvatarImage src={`${avatarPath()}${avatarVersion ? `?v=${avatarVersion}` : ""}`} alt={user.fullName} />
              )}
              <AvatarFallback className="text-lg">{initials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <p className="text-sm font-medium">{user.email}</p>
              <div className="flex items-center gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onPickAvatar} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadAvatar.isPending}
                >
                  <Camera />
                  {uploadAvatar.isPending ? "Envoi…" : "Changer la photo"}
                </Button>
                {user.hasAvatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAvatar.mutate()}
                    disabled={removeAvatar.isPending}
                  >
                    <Trash2 />
                    Supprimer
                  </Button>
                )}
              </div>
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
              <Controller
                control={control}
                name="titre"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Titre</FieldLabel>
                    <Input {...field} id={field.name} placeholder="Directeur Crédit Marketing" aria-invalid={fieldState.invalid} />
                    <FieldDescription>Utilisé si vous apparaissez comme signataire sur un document.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="civility"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Civilité</FieldLabel>
                    <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger id={field.name} className="w-full" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {CIVILITIES.map((civility) => (
                          <SelectItem key={civility} value={civility}>
                            {CIVILITY_LABELS[civility]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Utilisée pour vous désigner (Monsieur / Madame) si vous apparaissez comme signataire.
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="signatoryOptIn"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} orientation="horizontal">
                    <Checkbox id={field.name} checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                    <FieldLabel htmlFor={field.name} className="font-normal">
                      Apparaître comme signataire sélectionnable sur les documents
                    </FieldLabel>
                  </Field>
                )}
              />
              {errors.root && <FieldError errors={[errors.root]} />}
            </FieldGroup>
            <div className="mt-4 flex items-center gap-2">
              <SubmitButton
                formState={{ isSubmitting: updateProfile.isPending, isDirty }}
                requireDirty
                pendingLabel="Enregistrement…"
              >
                Enregistrer
              </SubmitButton>
              <Button
                type="button"
                variant="outline"
                disabled={!isDirty}
                onClick={() =>
                  reset({
                    fullName: user.fullName,
                    titre: user.titre ?? "",
                    civility: user.civility ?? undefined,
                    signatoryOptIn: user.signatoryOptIn,
                  })
                }
              >
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
