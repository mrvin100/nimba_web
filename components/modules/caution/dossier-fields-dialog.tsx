"use client";

import { useState } from "react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useUpdateDossier } from "./useCaution";
import { DOSSIER_FIELD_GROUPS, type DossierFieldDef } from "./dossier-fields";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NO_ANSWER = "__none__";

interface DossierFieldsDialogProps {
  dossierId: string;
  content: Record<string, string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DossierFieldInput({
  field,
  value,
  onChange,
}: {
  field: DossierFieldDef;
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.type === "textarea") {
    return <Textarea id={field.key} value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === "ouinon") {
    return (
      <Select value={value || NO_ANSWER} onValueChange={(next) => onChange(next === NO_ANSWER ? "" : next)}>
        <SelectTrigger id={field.key} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_ANSWER}>Non renseigné</SelectItem>
          <SelectItem value="Oui">Oui</SelectItem>
          <SelectItem value="Non">Non</SelectItem>
        </SelectContent>
      </Select>
    );
  }
  return (
    <Input id={field.key} type={field.type === "date" ? "date" : "text"} value={value} onChange={(e) => onChange(e.target.value)} />
  );
}

/**
 * Edits a dossier's shared content — the market context plus the fields the
 * Notification and Fiche companions consume — grouped by section. Seeded from
 * the current content when opened.
 */
export function DossierFieldsDialog({ dossierId, content, open, onOpenChange }: DossierFieldsDialogProps) {
  const update = useUpdateDossier(dossierId);
  const [values, setValues] = useState<Record<string, string>>({});
  const [rootError, setRootError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  // Seed from the current content when the dialog opens; reset the marker when it closes.
  if (open && !seeded) {
    setValues(content);
    setRootError(null);
    setSeeded(true);
  }
  if (!open && seeded) {
    setSeeded(false);
  }

  function setValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setRootError(null);
    try {
      await update.mutateAsync({ content: values });
      onOpenChange(false);
    } catch (error) {
      setRootError(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Informations du dossier</DialogTitle>
          <DialogDescription>Ces informations alimentent la fiche d&apos;approbation et la notification.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-5">
          {DOSSIER_FIELD_GROUPS.map((group) => (
            <div key={group.title} className="space-y-3">
              <p className="text-sm font-semibold text-foreground">{group.title}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {group.fields.map((field) => (
                  <Field key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
                    <FieldLabel htmlFor={field.key}>{field.label}</FieldLabel>
                    <DossierFieldInput field={field} value={values[field.key] ?? ""} onChange={(v) => setValue(field.key, v)} />
                  </Field>
                ))}
              </div>
            </div>
          ))}
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
          <SubmitButton formState={{ isSubmitting: update.isPending }} pendingLabel="Enregistrement en cours" onClick={handleSubmit}>
            Enregistrer
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
