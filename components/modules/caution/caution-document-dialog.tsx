"use client";

import { useState } from "react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useCreateCaution, useUpdateCaution } from "./useCaution";
import { CautionFieldsGrid, isFieldSatisfied, valueFor } from "./caution-form-fields";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

interface CautionDocumentDialogProps {
  dossierId: string;
  clientId: string;
  documentType: CautionDocumentType;
  typeLabel: string;
  /** The document type's SPECIFIC fields only — the common ones are inherited from the dossier. */
  fields: CautionFieldDefinition[];
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
 * from the dossier and never re-entered.
 */
export function CautionDocumentDialog({
  dossierId,
  clientId,
  documentType,
  typeLabel,
  fields,
  document,
  requireReason,
  open,
  onOpenChange,
}: CautionDocumentDialogProps) {
  const create = useCreateCaution();
  const update = useUpdateCaution(document?.id ?? "");
  const [values, setValues] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");
  const [rootError, setRootError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  // Seed from the document (edit) or a blank form (add) when the dialog opens.
  if (open && !seeded) {
    setValues(document?.content ?? {});
    setReason("");
    setRootError(null);
    setSeeded(true);
  }
  if (!open && seeded) setSeeded(false);

  const isEdit = Boolean(document);
  const allFilled = fields.every((field) => isFieldSatisfied(field, values));
  const reasonOk = !requireReason || reason.trim().length > 0;
  const canSubmit = allFilled && reasonOk;
  const pending = create.isPending || update.isPending;

  function setValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setRootError(null);
    const content: Record<string, string> = {};
    fields.forEach((field) => {
      content[field.key] = valueFor(field, values);
    });
    try {
      if (document) {
        await update.mutateAsync({ content, reason: reason.trim() || undefined });
      } else {
        await create.mutateAsync({ clientId, documentType, content, dossierId });
      }
      onOpenChange(false);
    } catch (error) {
      setRootError(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>
            {isEdit ? "Modifier" : "Ajouter"} : {typeLabel}
          </DialogTitle>
          <DialogDescription>
            Seuls les champs propres à ce document sont demandés. Les informations communes proviennent du dossier.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ce document n&apos;a pas de champ spécifique : il hérite entièrement du dossier.</p>
          ) : (
            <CautionFieldsGrid fields={fields} values={values} onChange={setValue} />
          )}

          {requireReason && (
            <Field>
              <FieldLabel htmlFor="document-edit-reason">Motif de la modification</FieldLabel>
              <Textarea id="document-edit-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
          )}

          {rootError && (
            <Field data-invalid>
              <FieldError errors={[{ message: rootError }]} />
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
            formState={{ isSubmitting: pending }}
            disabled={!canSubmit}
            pendingLabel="Enregistrement en cours"
            onClick={handleSubmit}
          >
            {isEdit ? "Enregistrer" : "Ajouter"}
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
