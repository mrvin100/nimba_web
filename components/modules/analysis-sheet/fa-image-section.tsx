"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { ImagePlus, Trash2 } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useDeleteFaSectionImage, useUpdateFaSection, useUploadFaSectionImage } from "./useAnalysisSheet";
import { faSectionImagePath } from "./analysis-sheet.service";
import type { FaImageContent, FaSection } from "./schema";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

function parseContent(json: string | null): FaImageContent {
  if (!json) return {};
  try {
    return JSON.parse(json) as FaImageContent;
  } catch {
    return {};
  }
}

/**
 * Editor of an IMAGE section (organigramme, figures du marché, facture
 * proforma, annexes) — narrative text plus uploaded figures embedded in the
 * export at the section's position, each with an optional caption.
 */
export function FaImageSection({
  caseId,
  section,
  locked,
}: Readonly<{ caseId: string; section: FaSection; locked: boolean }>) {
  const update = useUpdateFaSection(caseId);
  const upload = useUploadFaSectionImage(caseId);
  const remove = useDeleteFaSectionImage(caseId);
  const fileInput = useRef<HTMLInputElement>(null);
  const form = useForm<FaImageContent>({ values: parseContent(section.contentJson) });

  const gallery = (
    <div className="grid gap-4 sm:grid-cols-2">
      {section.images.map((image) => (
        <figure key={image.id} className="space-y-1 rounded-md border p-2">
          {/* Same-origin session-cookie URL, unknown dimensions — the next/image optimizer cannot fetch it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={faSectionImagePath(caseId, section.key, image.id)} alt={image.caption ?? image.fileName} className="max-h-64 w-full rounded object-contain" />
          <figcaption className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{image.caption ?? image.fileName}</span>
            {!locked && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Supprimer cette image"
                onClick={() => remove.mutate({ key: section.key, imageId: image.id })}
              >
                <Trash2 />
              </Button>
            )}
          </figcaption>
        </figure>
      ))}
    </div>
  );

  if (locked) {
    const content = parseContent(section.contentJson);
    return (
      <div className="space-y-3">
        {content.narrative && <p className="whitespace-pre-wrap text-sm">{content.narrative}</p>}
        {section.images.length > 0 ? gallery : <p className="text-sm text-muted-foreground">Aucune image.</p>}
        {content.commentaire && <p className="whitespace-pre-wrap text-sm">{content.commentaire}</p>}
      </div>
    );
  }

  function onSubmit(values: FaImageContent) {
    const content: FaImageContent = {
      narrative: values.narrative || undefined,
      commentaire: values.commentaire || undefined,
    };
    update.mutate(
      { key: section.key, contentJson: JSON.stringify(content) },
      { onError: (error) => form.setError("root", { message: getErrorMessage(error) }) },
    );
  }

  function onFileChosen(files: FileList | null) {
    const file = files?.item(0);
    if (!file) return;
    const caption = window.prompt("Légende de la figure (optionnelle) :") ?? undefined;
    upload.mutate({ key: section.key, file, caption: caption || undefined });
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <div className="space-y-4">
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-3">
        <Textarea {...form.register("narrative")} rows={4} placeholder="Texte de la section…" />
        <Textarea {...form.register("commentaire")} rows={3} placeholder="Commentaire (imprimé sous les figures)…" />
        {form.formState.errors.root && (
          <Field data-invalid>
            <FieldError errors={[form.formState.errors.root]} />
          </Field>
        )}
        <div className="flex justify-end">
          <SubmitButton
            formState={{ isSubmitting: update.isPending, isDirty: form.formState.isDirty }}
            requireDirty
            pendingLabel="Enregistrement…"
            variant="outline"
          >
            Enregistrer
          </SubmitButton>
        </div>
      </form>

      {section.images.length > 0 && gallery}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onFileChosen(event.target.files)}
      />
      <Button type="button" variant="outline" size="sm" disabled={upload.isPending} onClick={() => fileInput.current?.click()}>
        <ImagePlus />
        {upload.isPending ? "Envoi…" : "Ajouter une image"}
      </Button>
    </div>
  );
}
