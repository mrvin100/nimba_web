"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ClientPicker } from "@/components/modules/client";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useCautionDocumentTypes, useCreateCaution, useReferenceSequenceStatus } from "./useCaution";
import type { CautionDocumentType, CautionFieldDefinition } from "./schema";
import { CautionFieldsGrid, isFieldSatisfied, valueFor } from "./caution-form-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

/**
 * The generic document engine's create form, built entirely from
 * `GET /cautions/document-types` metadata, never a hardcoded page per type.
 * Selecting several types merges their fields: shared fields are asked once,
 * a type's specific fields appear only under its own heading. Submitting
 * creates one caution per selected type, each with its own reference number.
 */
export function CreateCautionDialog() {
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<CautionDocumentType[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [startingSequence, setStartingSequence] = useState("");
  const [rootError, setRootError] = useState<string | null>(null);
  const { data: documentTypes, isPending: typesPending } = useCautionDocumentTypes();
  const { data: referenceSequenceStatus } = useReferenceSequenceStatus();
  const createCaution = useCreateCaution();

  const selectedDefinitions = useMemo(
    () => (documentTypes ?? []).filter((dt) => selectedTypes.includes(dt.code)),
    [documentTypes, selectedTypes],
  );

  const sharedFields: CautionFieldDefinition[] = selectedDefinitions[0]?.sharedFields ?? [];

  const allFields = useMemo(() => {
    const byKey = new Map<string, CautionFieldDefinition>();
    selectedDefinitions.forEach((dt) => {
      dt.sharedFields.forEach((field) => byKey.set(field.key, field));
      dt.specificFields.forEach((field) => byKey.set(field.key, field));
    });
    return [...byKey.values()];
  }, [selectedDefinitions]);

  const canSubmit = Boolean(clientId) && selectedTypes.length > 0 && allFields.every((field) => isFieldSatisfied(field, values));
  const showStartingSequence = referenceSequenceStatus?.initialized === false;

  function setValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleType(code: CautionDocumentType, checked: boolean) {
    setSelectedTypes((prev) => (checked ? [...prev, code] : prev.filter((type) => type !== code)));
  }

  function reset() {
    setClientId(null);
    setSelectedTypes([]);
    setValues({});
    setStartingSequence("");
    setRootError(null);
  }

  async function handleSubmit() {
    if (!clientId || selectedDefinitions.length === 0) return;
    setRootError(null);
    try {
      for (const [index, dt] of selectedDefinitions.entries()) {
        const content: Record<string, string> = {};
        [...dt.sharedFields, ...dt.specificFields].forEach((field) => {
          content[field.key] = valueFor(field, values);
        });
        // Sequential on purpose: each document needs its own reference number, assigned atomically by the backend one at a time.
        // The starting sequence only ever takes effect on the very first caution system-wide, so it is harmless to pass it every time.
        await createCaution.mutateAsync({
          clientId,
          documentType: dt.code,
          content,
          startingReferenceSequence:
            showStartingSequence && index === 0 && startingSequence.trim() ? Number(startingSequence) : undefined,
        });
      }
      setOpen(false);
      reset();
    } catch (error) {
      setRootError(getErrorMessage(error));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nouveau document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95vw] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Nouveau document</DialogTitle>
          <DialogDescription>
            Choisissez le client et le ou les documents à générer. Les champs communs ne sont saisis qu&apos;une seule fois.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            <Field className="w-full">
              <FieldLabel>Client</FieldLabel>
              <ClientPicker value={clientId} onChange={setClientId} />
            </Field>

            <Field className="w-full">
              <FieldLabel>Documents à générer</FieldLabel>
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                {typesPending && <p className="text-sm text-muted-foreground">Chargement des types de documents</p>}
                {documentTypes?.map((dt) => (
                  <label key={dt.code} htmlFor={`type-${dt.code}`} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      id={`type-${dt.code}`}
                      checked={selectedTypes.includes(dt.code)}
                      onCheckedChange={(checked) => toggleType(dt.code, checked === true)}
                    />
                    <span className="font-normal">
                      {dt.label} ({dt.code})
                    </span>
                  </label>
                ))}
              </div>
            </Field>
          </div>

          {showStartingSequence && (
            <div className="space-y-3">
              <Separator />
              <Field>
                <FieldLabel htmlFor="starting-reference-sequence">Numéro de départ (première caution)</FieldLabel>
                <Input
                  id="starting-reference-sequence"
                  type="number"
                  min={1}
                  placeholder="Pour reprendre la numérotation papier existante"
                  value={startingSequence}
                  onChange={(event) => setStartingSequence(event.target.value)}
                />
              </Field>
            </div>
          )}

          {sharedFields.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <p className="text-sm font-semibold text-foreground">Champs communs</p>
              <CautionFieldsGrid fields={sharedFields} values={values} onChange={setValue} />
            </div>
          )}

          {selectedDefinitions.map(
            (dt) =>
              dt.specificFields.length > 0 && (
                <div key={dt.code} className="space-y-4">
                  <Separator />
                  <p className="text-sm font-semibold text-foreground">Champs spécifiques : {dt.label}</p>
                  <CautionFieldsGrid fields={dt.specificFields} values={values} onChange={setValue} />
                </div>
              ),
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
            formState={{ isSubmitting: createCaution.isPending }}
            disabled={!canSubmit}
            pendingLabel="Création en cours"
            onClick={handleSubmit}
          >
            Créer{selectedTypes.length > 1 ? ` (${selectedTypes.length})` : ""}
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
