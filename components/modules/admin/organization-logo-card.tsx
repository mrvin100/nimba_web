"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, Trash2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-error";
import { useDeleteOrganizationLogo, useOrganization, useUploadOrganizationLogo } from "./useAdmin";
import { organizationLogoPath } from "./admin-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Organisation logo management: drag-and-drop (or click) to upload/replace, plus
 * remove. The image is printed on generated documents (traités) and shown on the
 * login screen. The preview doubles as the drop target, cache-busted on change so the
 * new logo shows immediately.
 */
export function OrganizationLogoCard() {
  const { data, isPending, isError } = useOrganization();
  const upload = useUploadOrganizationLogo();
  const remove = useDeleteOrganizationLogo();
  const fileRef = useRef<HTMLInputElement>(null);
  const [version, setVersion] = useState(0);
  const [dragging, setDragging] = useState(false);

  async function uploadFile(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Le logo doit être une image (PNG ou JPEG).");
      return;
    }
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
    return <Skeleton className="h-52 w-full" />;
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">Impossible de charger le logo. Veuillez réessayer.</p>;
  }

  const busy = upload.isPending;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Logo</CardTitle>
        <CardDescription>Imprimé sur les documents générés (traités) et affiché sur l&apos;écran de connexion.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            role="button"
            tabIndex={0}
            aria-disabled={busy}
            onClick={() => !busy && fileRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (!busy) fileRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!busy) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              if (!busy) void uploadFile(event.dataTransfer.files?.[0]);
            }}
            className={cn(
              "flex min-h-36 flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              dragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/40",
              busy && "pointer-events-none opacity-60",
            )}
          >
            {data.hasLogo ? (
              // eslint-disable-next-line @next/next/no-img-element -- backend-served binary, not a static asset
              <img
                src={`${organizationLogoPath()}${version ? `?v=${version}` : ""}`}
                alt={`Logo ${data.organizationName}`}
                className="max-h-24 w-auto object-contain"
              />
            ) : (
              <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ImageIcon className="size-5" />
              </div>
            )}
            <p className="text-sm">
              <span className="font-medium text-foreground">Cliquez pour choisir</span> ou glissez-déposez une image
            </p>
            <p className="text-xs text-muted-foreground">{busy ? "Envoi…" : "PNG ou JPEG, fond transparent de préférence"}</p>
          </div>

          <div className="flex shrink-0 gap-2 sm:flex-col">
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(event) => void uploadFile(event.target.files?.[0])} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
              <UploadCloud />
              {data.hasLogo ? "Remplacer" : "Ajouter"}
            </Button>
            {data.hasLogo && (
              <Button type="button" variant="ghost" size="sm" onClick={onRemove} disabled={remove.isPending}>
                <Trash2 />
                Supprimer
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
