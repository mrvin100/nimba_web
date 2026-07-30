"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { SignatoryCombobox } from "@/components/modules/signatory";
import { CIVILITY_LABELS } from "@/components/modules/identity";
import { useUpdateDossier } from "./useCaution";
import { DOSSIER_SECTIONS, type DossierFieldDef, type DossierSectionId } from "./dossier-fields";
import { RequiredMark } from "./required-mark";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NO_ANSWER = "__none__";

/** Section 6 condition rows, in the order the Fiche renderer expects (row index 0..3). */
const CONDITION_LABELS = ["Com. d'engagement", "Frais de caution", "Frais de délivrance", "Frais d'attestation"];

/** Every field declared across the sections (excludes the dynamic per-lot condition keys). */
const ALL_FIELDS: DossierFieldDef[] = DOSSIER_SECTIONS.flatMap((section) =>
  section.groups.flatMap((group) => group.fields),
);

/** Which section each field lives in, so an invalid submit can jump to the right tab. */
const SECTION_BY_FIELD_KEY = new Map<string, DossierSectionId>(
  DOSSIER_SECTIONS.flatMap((section) => section.groups.flatMap((group) => group.fields.map((field) => [field.key, section.id]))),
);

/**
 * The dossier's content is a free-form key/value bag: the declared fields plus
 * dynamic per-lot keys (`cond_<row>_<col>`) and the resolved signataire
 * civilités. We validate the declared required fields and let `.catchall` keep
 * every other string key untouched.
 */
const dossierContentSchema = z
  .object(
    Object.fromEntries(
      ALL_FIELDS.map((field) => [
        field.key,
        field.required ? z.string().trim().min(1, field.requiredMessage ?? "Ce champ est obligatoire.") : z.string(),
      ]),
    ),
  )
  .catchall(z.string());
type DossierContentInput = z.infer<typeof dossierContentSchema>;

/**
 * Seed every declared field to "" (so a required field validates against our
 * message instead of a bare "Required", and dirty-tracking has a stable
 * baseline), then overlay the persisted content, which preserves the dynamic
 * `cond_*` and civilité keys the declared list does not know about.
 */
function buildDefaultValues(content: Record<string, string>): DossierContentInput {
  const seeded = Object.fromEntries(ALL_FIELDS.map((field) => [field.key, ""]));
  return { ...seeded, ...content } as DossierContentInput;
}

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
  onBlur,
  disabled,
  invalid,
}: {
  field: DossierFieldDef;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  if (field.type === "textarea") {
    return (
      <Textarea
        id={field.key}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={field.placeholder}
        aria-invalid={invalid}
        aria-required={field.required}
      />
    );
  }
  if (field.type === "ouinon") {
    return (
      <Select value={value || NO_ANSWER} onValueChange={(next) => onChange(next === NO_ANSWER ? "" : next)} disabled={disabled}>
        <SelectTrigger id={field.key} className="w-full" aria-invalid={invalid} aria-required={field.required}>
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
    <Input
      id={field.key}
      type={field.type === "date" ? "date" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={field.placeholder}
      aria-invalid={invalid}
      aria-required={field.required}
    />
  );
}

/**
 * A signataire slot (nom + titre) locks once filled from the combobox — "Modifier"
 * reopens it for a manual correction. Civilité is never typed by hand: it is
 * resolved from whichever signatory the combobox picks (their profile or standalone
 * record) and written straight into [civiliteFieldKey], which stays out of the
 * visible form since nothing here can pick it. A manual (non-combobox) nom/titre
 * still submits with whatever civilité was last resolved, or none.
 */
function SignatoryFieldsGroup({
  index,
  civiliteFieldKey,
  nomField,
  titreField,
  form,
}: {
  index: 1 | 2;
  civiliteFieldKey: string;
  nomField: DossierFieldDef;
  titreField: DossierFieldDef;
  form: ReturnType<typeof useForm<DossierContentInput>>;
}) {
  const [locked, setLocked] = useState(false);
  const civilite = useWatch({ control: form.control, name: civiliteFieldKey });

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-xs font-medium text-muted-foreground">
          Signataire {index}
          {civilite && ` (${civilite})`}
        </p>
        <SignatoryCombobox
          onSelect={(nom, titre, civility) => {
            form.setValue(nomField.key, nom, { shouldDirty: true });
            form.setValue(titreField.key, titre, { shouldDirty: true });
            form.setValue(civiliteFieldKey, civility ? CIVILITY_LABELS[civility] : "", { shouldDirty: true });
            setLocked(true);
          }}
        />
      </div>
      <div className="space-y-3">
        <Controller
          control={form.control}
          name={nomField.key}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={nomField.key}>
                {nomField.label}
                {nomField.required && <RequiredMark />}
              </FieldLabel>
              <DossierFieldInput
                field={nomField}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={locked}
                invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name={titreField.key}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={titreField.key}>
                {titreField.label}
                {titreField.required && <RequiredMark />}
              </FieldLabel>
              <div className="flex items-center gap-1">
                <DossierFieldInput
                  field={titreField}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={locked}
                  invalid={fieldState.invalid}
                />
                {locked && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setLocked(false)}
                  >
                    <Pencil className="size-3.5" />
                    Modifier
                  </Button>
                )}
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </div>
  );
}

/** One declared field, wired for accessible validation feedback (label "*", aria-invalid, inline error). */
function DossierField({ field, form }: { field: DossierFieldDef; form: ReturnType<typeof useForm<DossierContentInput>> }) {
  return (
    <Controller
      control={form.control}
      name={field.key}
      render={({ field: controllerField, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className={field.type === "textarea" ? "sm:col-span-2" : undefined}
        >
          <FieldLabel htmlFor={field.key}>
            {field.label}
            {field.required && <RequiredMark />}
          </FieldLabel>
          <DossierFieldInput
            field={field}
            value={controllerField.value ?? ""}
            onChange={controllerField.onChange}
            onBlur={controllerField.onBlur}
            invalid={fieldState.invalid}
          />
          {field.description && <FieldDescription>{field.description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

/**
 * The per-lot condition grid on the Fiche tab. Isolated into its own component
 * so it subscribes to `lots` via `useWatch` on its own: only this block
 * re-renders as the user edits the lots field, not the entire dialog.
 */
function FicheConditions({ form }: { form: ReturnType<typeof useForm<DossierContentInput>> }) {
  const lotsValue = (useWatch({ control: form.control, name: "lots" }) as string | undefined) ?? "";
  const lots = lotsValue
    .split(",")
    .map((lot) => lot.trim())
    .filter((lot) => lot.length > 0);

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">Conditions par lot</p>
      {lots.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Renseignez d&apos;abord les lots (onglet « Informations communes ») pour saisir les montants par lot.
        </p>
      ) : (
        <div className="space-y-4">
          {CONDITION_LABELS.map((label, row) => (
            <div key={label} className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {lots.map((lot, col) => {
                  const key = `cond_${row}_${col}`;
                  return (
                    <Controller
                      key={key}
                      control={form.control}
                      name={key}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel htmlFor={key}>{lot}</FieldLabel>
                          <Input
                            id={key}
                            inputMode="numeric"
                            placeholder="0"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </Field>
                      )}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Edits a dossier's shared content — the market context plus the fields the
 * Notification and Fiche companions consume — organized in one tab per
 * consumer (see dossier-fields.ts) so filling it in stays scannable instead
 * of one long page.
 */
export function DossierFieldsDialog({ dossierId, content, open, onOpenChange }: DossierFieldsDialogProps) {
  const update = useUpdateDossier(dossierId);
  const [activeTab, setActiveTab] = useState<DossierSectionId>(DOSSIER_SECTIONS[0].id);
  const defaultValues = useMemo(() => buildDefaultValues(content), [content]);
  const form = useForm<DossierContentInput>({
    resolver: zodResolver(dossierContentSchema),
    mode: "onTouched",
    defaultValues,
  });

  async function onSubmit(values: DossierContentInput) {
    try {
      await update.mutateAsync({ content: values });
      onOpenChange(false);
    } catch (error) {
      form.setError("root", { message: getErrorMessage(error) });
    }
  }

  /** Jump to the tab holding the first invalid field so its error is visible. */
  function onInvalid(errors: FieldErrors<DossierContentInput>) {
    const firstErroredSection = Object.keys(errors)
      .map((key) => SECTION_BY_FIELD_KEY.get(key))
      .find((sectionId): sectionId is DossierSectionId => sectionId !== undefined);
    if (firstErroredSection) {
      setActiveTab(firstErroredSection);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          form.reset(buildDefaultValues(content));
          setActiveTab(DOSSIER_SECTIONS[0].id);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] w-[95vw] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Informations du dossier</DialogTitle>
          <DialogDescription>Ces informations alimentent la fiche d&apos;approbation et la notification.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate className="contents">
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DossierSectionId)}>
              <TabsList>
                {DOSSIER_SECTIONS.map((section) => (
                  <TabsTrigger key={section.id} value={section.id}>
                    {section.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              {DOSSIER_SECTIONS.map((section) => (
                <TabsContent key={section.id} value={section.id} className="space-y-6 pt-4">
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                  {section.groups.map((group) => (
                    <div key={group.title} className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">{group.title}</p>
                      {group.title === "Signataires" ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <SignatoryFieldsGroup
                            index={1}
                            civiliteFieldKey={group.fields[0].key}
                            nomField={group.fields[1]}
                            titreField={group.fields[2]}
                            form={form}
                          />
                          <SignatoryFieldsGroup
                            index={2}
                            civiliteFieldKey={group.fields[3].key}
                            nomField={group.fields[4]}
                            titreField={group.fields[5]}
                            form={form}
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {group.fields.map((fieldDef) => (
                            <DossierField key={fieldDef.key} field={fieldDef} form={form} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {section.id === "fiche" && <FicheConditions form={form} />}
                </TabsContent>
              ))}
            </Tabs>

            {form.formState.errors.root && (
              <Field data-invalid className="mt-4">
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
              formState={{ isSubmitting: update.isPending, isDirty: form.formState.isDirty }}
              requireDirty
              pendingLabel="Enregistrement en cours"
            >
              Enregistrer
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
