"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ClientPicker } from "@/components/modules/client";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useCautionDocumentTypes, useCreateCaution } from "./useCaution";
import type { CautionDocumentType, CautionFieldDefinition } from "./schema";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function fieldInputType(type: CautionFieldDefinition["type"]): string {
  if (type === "DATE") return "date";
  return "text";
}

/**
 * The generic document engine's create form, built entirely from
 * `GET /cautions/document-types` metadata — never a hardcoded page per type.
 * Selecting several types merges their fields: shared fields are asked once,
 * a type's specific fields appear only under its own heading. Submitting
 * creates one caution per selected type, each with its own reference number.
 */
export function CreateCautionDialog() {
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<CautionDocumentType[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [rootError, setRootError] = useState<string | null>(null);
  const { data: documentTypes, isPending: typesPending } = useCautionDocumentTypes();
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

  const canSubmit = Boolean(clientId) && selectedTypes.length > 0 && allFields.every((field) => values[field.key]?.trim());

  function toggleType(code: CautionDocumentType, checked: boolean) {
    setSelectedTypes((prev) => (checked ? [...prev, code] : prev.filter((type) => type !== code)));
  }

  function reset() {
    setClientId(null);
    setSelectedTypes([]);
    setValues({});
    setRootError(null);
  }

  async function handleSubmit() {
    if (!clientId || selectedDefinitions.length === 0) return;
    setRootError(null);
    try {
      for (const dt of selectedDefinitions) {
        const content: Record<string, string> = {};
        [...dt.sharedFields, ...dt.specificFields].forEach((field) => {
          content[field.key] = values[field.key] ?? "";
        });
        // Sequential on purpose: each document needs its own reference number, assigned atomically by the backend one at a time.
        await createCaution.mutateAsync({ clientId, documentType: dt.code, content });
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
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau document</DialogTitle>
          <DialogDescription>
            Choisissez le client et les documents à générer — les champs communs ne sont demandés qu&apos;une fois.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel>Client</FieldLabel>
            <ClientPicker value={clientId} onChange={setClientId} />
          </Field>

          <Field>
            <FieldLabel>Documents à générer</FieldLabel>
            <div className="space-y-2">
              {typesPending && <p className="text-sm text-muted-foreground">Chargement…</p>}
              {documentTypes?.map((dt) => (
                <div key={dt.code} className="flex items-center gap-2">
                  <Checkbox
                    id={`type-${dt.code}`}
                    checked={selectedTypes.includes(dt.code)}
                    onCheckedChange={(checked) => toggleType(dt.code, checked === true)}
                  />
                  <Label htmlFor={`type-${dt.code}`} className="font-normal">
                    {dt.label} ({dt.code})
                  </Label>
                </div>
              ))}
            </div>
          </Field>

          {sharedFields.length > 0 && (
            <>
              <Separator />
              <p className="text-sm font-medium">Champs communs</p>
              {sharedFields.map((field) => (
                <Field key={field.key}>
                  <FieldLabel htmlFor={field.key}>{field.label}</FieldLabel>
                  <Input
                    id={field.key}
                    type={fieldInputType(field.type)}
                    value={values[field.key] ?? ""}
                    onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                  />
                </Field>
              ))}
            </>
          )}

          {selectedDefinitions.map(
            (dt) =>
              dt.specificFields.length > 0 && (
                <div key={dt.code} className="space-y-4">
                  <Separator />
                  <p className="text-sm font-medium">Spécifique {dt.label}</p>
                  {dt.specificFields.map((field) => (
                    <Field key={field.key}>
                      <FieldLabel htmlFor={field.key}>{field.label}</FieldLabel>
                      <Input
                        id={field.key}
                        type={fieldInputType(field.type)}
                        value={values[field.key] ?? ""}
                        onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                      />
                    </Field>
                  ))}
                </div>
              ),
          )}

          {rootError && (
            <Field data-invalid>
              <FieldError errors={[{ message: rootError }]} />
            </Field>
          )}
        </FieldGroup>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </DialogClose>
          <SubmitButton
            formState={{ isSubmitting: createCaution.isPending }}
            disabled={!canSubmit}
            pendingLabel="Création…"
            onClick={handleSubmit}
          >
            Créer{selectedTypes.length > 1 ? ` (${selectedTypes.length})` : ""}
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
