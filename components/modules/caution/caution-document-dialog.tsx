"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useCreateCaution, useNextSequence, useUpdateCaution } from "./useCaution";
import { CautionFieldsGrid, defaultValueFor } from "./caution-form-fields";
import { RequiredMark } from "./required-mark";
import type { Caution, CautionDocumentType, CautionFieldDefinition } from "./schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/** A field's required message, tailored to its input type so the error reads naturally. */
function requiredMessage(field: CautionFieldDefinition): string {
  switch (field.type) {
    case "DATE":
      return `Choisissez une date pour « ${field.label} ».`;
    case "AMOUNT":
      return `Indiquez un montant pour « ${field.label} ».`;
    case "CURRENCY":
      return "Choisissez une devise.";
    case "CIVILITY":
      return `Choisissez une civilité pour « ${field.label} ».`;
    default:
      return `Le champ « ${field.label} » est obligatoire.`;
  }
}

function buildContentSchema(fields: CautionFieldDefinition[]) {
  return z.object(
    Object.fromEntries(
      fields.map((field) => [
        field.key,
        field.optional
          ? z.string()
          : field.type === "AMOUNT"
            ? z
                .string()
                .trim()
                .min(1, requiredMessage(field))
                .regex(/^[\d\s]+([.,]\d+)?$/, `« ${field.label} » doit être un montant numérique.`)
            : z.string().trim().min(1, requiredMessage(field)),
      ]),
    ),
  );
}

function buildSchema(fields: CautionFieldDefinition[], isPro: boolean, requireReason: boolean) {
  return z.object({
    content: buildContentSchema(fields),
    sequence: isPro
      ? z.string().optional()
      : z
          .string()
          .trim()
          .min(1, "Le numéro de référence est requis.")
          .regex(/^\d+$/, "Le numéro de référence doit être composé uniquement de chiffres."),
    originDocumentId: isPro ? z.string().min(1, "Choisissez la caution de soumission d'origine.") : z.string().optional(),
    reason: requireReason ? z.string().trim().min(1, "Indiquez le motif de la modification.") : z.string().optional(),
  });
}

type DocumentFormInput = z.infer<ReturnType<typeof buildSchema>>;

function buildDefaultContent(fields: CautionFieldDefinition[], content: Record<string, string> | undefined) {
  return Object.fromEntries(fields.map((field) => [field.key, defaultValueFor(field, content)]));
}

interface CautionDocumentDialogProps {
  dossierId: string;
  clientId: string;
  documentType: CautionDocumentType;
  typeLabel: string;
  /** The document type's SPECIFIC fields only — the common ones are inherited from the dossier. */
  fields: CautionFieldDefinition[];
  /** The dossier's finalized SMS documents — a PRO's origin picker offers only these. */
  originCandidates?: Caution[];
  /** The lots the dossier declared; the document's own "lot" field picks one of them. */
  lotChoices?: string[];
  /** Present ⇒ edit mode; absent ⇒ add mode. */
  document?: Caution;
  /** When true (during a prorogation), a reason is required and journaled. */
  requireReason?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Adds or edits one document within a dossier. It only asks the type's SPECIFIC
 * fields — the common context (bénéficiaire, marché, signataires…) is inherited
 * from the dossier and never re-entered. A non-PRO document also asks for its
 * reference number (pre-filled with the next free value in its own series,
 * editable); a PRO instead picks the SMS it prorogates and inherits that
 * document's reference number entirely.
 */
export function CautionDocumentDialog({
  dossierId,
  clientId,
  documentType,
  typeLabel,
  fields,
  originCandidates = [],
  lotChoices = [],
  document,
  requireReason = false,
  open,
  onOpenChange,
}: CautionDocumentDialogProps) {
  const isEdit = Boolean(document);
  const isPro = documentType === "PRO";
  const create = useCreateCaution();
  const update = useUpdateCaution(document?.id ?? "");
  const { data: suggestedSequence } = useNextSequence(documentType, open && !isEdit && !isPro);

  const schema = useMemo(() => buildSchema(fields, isPro, requireReason), [fields, isPro, requireReason]);

  const defaultValues = useMemo<DocumentFormInput>(
    () => ({
      content: buildDefaultContent(fields, document?.content),
      sequence: document ? String(document.sequence) : "",
      originDocumentId: "",
      reason: "",
    }),
    [fields, document],
  );

  const form = useForm<DocumentFormInput>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues,
  });

  function handleOpenChange(next: boolean) {
    if (next) form.reset(defaultValues);
    onOpenChange(next);
  }

  // The suggestion loads asynchronously right after the dialog opens; fill it
  // in once it arrives, but never clobber a value the analyst already touched.
  useEffect(() => {
    if (open && !isEdit && !isPro && suggestedSequence && !form.formState.dirtyFields.sequence) {
      form.setValue("sequence", String(suggestedSequence.sequence));
    }
  }, [open, isEdit, isPro, suggestedSequence, form]);

  async function onSubmit(values: DocumentFormInput) {
    try {
      if (document) {
        await update.mutateAsync({
          content: values.content,
          sequence: isPro ? undefined : Number(values.sequence),
          reason: values.reason || undefined,
        });
      } else {
        await create.mutateAsync({
          clientId,
          documentType,
          content: values.content,
          dossierId,
          sequence: isPro ? undefined : Number(values.sequence),
          originDocumentId: isPro ? values.originDocumentId : undefined,
        });
      }
      onOpenChange(false);
    } catch (error) {
      form.setError("root", { message: getErrorMessage(error) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>
            {isEdit ? "Modifier" : "Ajouter"} : {typeLabel}
          </DialogTitle>
          <DialogDescription>
            Seuls les champs propres à ce document sont demandés. Les informations communes proviennent du dossier.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="contents">
          <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
            {!isEdit && isPro && (
              <Controller
                control={form.control}
                name="originDocumentId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Caution de soumission d&apos;origine
                      <RequiredMark />
                    </FieldLabel>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} className="w-full" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Choisir la caution à proroger" />
                      </SelectTrigger>
                      <SelectContent>
                        {originCandidates.map((candidate) => (
                          <SelectItem key={candidate.id} value={candidate.id}>
                            {candidate.referenceNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      L&apos;avenant reprend exactement la référence de cette caution : ce n&apos;est pas un nouveau document,
                      seules ses dates changent.
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    {!fieldState.invalid && originCandidates.length === 0 && (
                      <FieldDescription className="text-destructive">
                        Aucune caution de soumission finalisée dans ce dossier à proroger.
                      </FieldDescription>
                    )}
                  </Field>
                )}
              />
            )}

            {!isPro && (
              <Controller
                control={form.control}
                name="sequence"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Numéro de référence
                      <RequiredMark />
                    </FieldLabel>
                    <Input {...field} id={field.name} inputMode="numeric" aria-invalid={fieldState.invalid} aria-required />
                    <FieldDescription>
                      Propre à la série des {documentType} ; pré-rempli avec le prochain numéro libre, modifiable si besoin.
                      Verrouillé une fois le document finalisé.
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            )}

            {fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ce document n&apos;a pas de champ spécifique : il hérite entièrement du dossier.</p>
            ) : (
              <CautionFieldsGrid
                fields={fields}
                control={form.control}
                pathFor={(key) => `content.${key}` as Path<DocumentFormInput>}
                lotChoices={lotChoices}
              />
            )}

            {requireReason && (
              <Controller
                control={form.control}
                name="reason"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Motif de la modification
                      <RequiredMark />
                    </FieldLabel>
                    <Textarea {...field} id={field.name} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            )}

            {form.formState.errors.root && (
              <Field data-invalid>
                <FieldError errors={[form.formState.errors.root]} />
              </Field>
            )}
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <SubmitButton
              formState={{ isSubmitting: create.isPending || update.isPending }}
              pendingLabel="Enregistrement en cours"
            >
              {isEdit ? "Enregistrer" : "Ajouter"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
