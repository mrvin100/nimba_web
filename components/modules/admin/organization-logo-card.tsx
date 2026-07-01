"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { ApiError } from "@/lib/api-error";
import { useDeleteOrganizationLogo, useOrganization, useUploadOrganizationLogo } from "./useAdmin";
import { organizationLogoPath } from "./admin-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Organisation logo management: upload/replace/remove the image that is printed on
 * generated documents (traités) and shown on the login screen. Mirrors the profile
 * avatar flow — an image picker uploading to the settings singleton, cache-busted on
 * change so the new logo shows immediately.
 */
export function OrganizationLogoCard() {
  const { data, isPending, isError } = useOrganization();
  const upload = useUploadOrganizationLogo();
  const remove = useDeleteOrganizationLogo();
  const fileRef = useRef<HTMLInputElement>(null);
  const [version, setVersion] = useState(0);

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      await upload.mutateAsync(file);
      setVersion(Date.now());
      toast.success("Logo mis à jour");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Le logo n'a pas pu être envoyé.");
    }
  }

  async function onRemove() {
    try {
      await remove.mutateAsync();
      toast.success("Logo supprimé");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Le logo n'a pas pu être supprimé.");
    }
  }

  if (isPending) {
    return <Skeleton className="h-48 w-full max-w-lg" />;
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">Impossible de charger le logo. Veuillez réessayer.</p>;
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Logo</CardTitle>
        <CardDescription>Imprimé sur les documents générés (traités) et affiché sur l&apos;écran de connexion.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30">
            {data.hasLogo ? (
              // eslint-disable-next-line @next/next/no-img-element -- backend-served binary, not a static asset
              <img
                src={`${organizationLogoPath()}${version ? `?v=${version}` : ""}`}
                alt={`Logo ${data.organizationName}`}
                className="size-full object-contain"
              />
            ) : (
              <ImageIcon className="size-8 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onPick} />
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={upload.isPending}>
                <Upload />
                {upload.isPending ? "Envoi…" : data.hasLogo ? "Remplacer" : "Ajouter un logo"}
              </Button>
              {data.hasLogo && (
                <Button type="button" variant="ghost" size="sm" onClick={onRemove} disabled={remove.isPending}>
                  <Trash2 />
                  Supprimer
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">PNG ou JPEG, fond transparent de préférence.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
