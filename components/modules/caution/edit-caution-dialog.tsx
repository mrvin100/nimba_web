"use client";

import { useMemo, useState } from "react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useCaution, useCautionDocumentTypes, useUpdateCaution } from "./useCaution";
import type { CautionFieldDefinition, CautionSummary } from "./schema";
import { CautionFieldsGrid, isFieldSatisfied, valueFor } from "./caution-form-fields";
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
import { Field, FieldError } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";

interface EditCautionDialogProps {
  caution: CautionSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Corrects a draft caution's fields before it is finalized, for when a value
 * was mistyped or a client sent an updated detail. Only drafts are editable:
 * a finalized caution is an official record and the backend refuses to change
 * it, so the row action that opens this is hidden once finalized.
 */
export function EditCautionDialog({ caution, open, onOpenChange }: EditCautionDialogProps) {
  const { data: documentTypes } = useCautionDocumentTypes();
  const { data: detail, isPending } = useCaution(caution.id, open);
  const update = useUpdateCaution(caution.id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [rootError, setRootError] = useState<string | null>(null);
  // Marks which server snapshot the form was seeded from, so the fields are
  // filled once when the dialog opens (and re-seeded on reopen) without a
  // render-triggering effect — the pattern React endorses for deriving state.
  const [seededFrom, setSeededFrom] = useState<string | null>(null);

  const fields: CautionFieldDefinition[] = useMemo(() => {
    const definition = documentTypes?.find((dt) => dt.code === caution.documentType);
    return definition ? [...definition.sharedFields, ...definition.specificFields] : [];
  }, [documentTypes, caution.documentType]);

  const snapshotKey = open && detail ? `${detail.id}:${detail.updatedAt}` : null;
  if (snapshotKey !== seededFrom) {
    setSeededFrom(snapshotKey);
    if (snapshotKey && detail) {
      setValues(detail.content);
      setRootError(null);
    }
  }

  const allFilled = fields.length > 0 && fields.every((field) => isFieldSatisfied(field, values));
  const isDirty = fields.some((field) => valueFor(field, values) !== (detail?.content[field.key] ?? ""));
  const canSubmit = allFilled && isDirty;

  function setValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setRootError(null);
    try {
      const content: Record<string, string> = {};
      fields.forEach((field) => {
        content[field.key] = valueFor(field, values);
      });
      await update.mutateAsync({ content });
      onOpenChange(false);
    } catch (error) {
      setRootError(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Modifier la caution {caution.referenceNumber}</DialogTitle>
          <DialogDescription>Corrigez les informations du brouillon avant de le finaliser.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
          {isPending || !detail ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <CautionFieldsGrid fields={fields} values={values} onChange={setValue} />
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
            formState={{ isSubmitting: update.isPending }}
            disabled={!canSubmit}
            pendingLabel="Enregistrement en cours"
            onClick={handleSubmit}
          >
            Enregistrer
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
