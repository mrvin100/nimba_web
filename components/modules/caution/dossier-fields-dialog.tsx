"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { SignatoryCombobox, useSignatoryOptions, type SignatoryOption } from "@/components/modules/signatory";
import { CIVILITY_LABELS } from "@/components/modules/identity";
import { useUpdateDossier } from "./useCaution";
import { parseLots } from "./caution-form-fields";
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

/**
 * The bank's fee schedule, mirroring com.nimba.caution.CautionFeeSchedule. Each
 * line is charged as `max(montant du lot x taux, minimum) x (1 + TVA)`; the
 * base says which of the lot's documents the montant comes from. Entered once
 * per dossier, it drives both the Notification's "CONDITIONS DE BANQUE" prose
 * and the Fiche's per-lot rentability columns, so the two can never disagree.
 */
const FEE_LINES = [
  { key: "bareme_0", label: "Com. d'engagement", taux: "1", min: "1000000", base: "CAUTION", tva: "13" },
  { key: "bareme_1", label: "Frais de caution", taux: "1", min: "1000000", base: "CAUTION", tva: "18" },
  { key: "bareme_2", label: "Frais de délivrance", taux: "0,1", min: "500000", base: "CAUTION", tva: "13" },
  { key: "bareme_3", label: "Frais d'attestation", taux: "0,1", min: "1000000", base: "ATTESTATION", tva: "18" },
] as const;

const FEE_BASE_LABELS: Record<string, string> = {
  CAUTION: "Montant de la caution (SMS)",
  ATTESTATION: "Montant de l'attestation (ACF/AFC)",
};

/** Every field declared across the sections (excludes the dynamic per-lot condition keys). */
const ALL_FIELDS: DossierFieldDef[] = DOSSIER_SECTIONS.flatMap((section) =>
  section.groups.flatMap((group) => group.fields),
);

/** Which section each field lives in, so an invalid submit can jump to the right tab. */
const SECTION_BY_FIELD_KEY = new Map<string, DossierSectionId>(
  DOSSIER_SECTIONS.flatMap((section) => section.groups.flatMap((group) => group.fields.map((field) => [field.key, section.id]))),
);

/**
 * A field's label and the tab it sits under, so an invalid submit can name what
 * is missing and where. Without it the analyst only sees a disabled save on a
 * tab that looks complete, with the offending field on another one.
 */
const FIELD_LOCATION = new Map<string, { label: string; sectionId: DossierSectionId; sectionTitle: string }>(
  DOSSIER_SECTIONS.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.fields.map((field) => [field.key, { label: field.label, sectionId: section.id, sectionTitle: section.title }] as const),
    ),
  ),
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
  // Dynamic keys (the fee schedule, and whatever an older dossier still carries)
  // are free-form and never required. They must stay optional: a bare z.string()
  // rejects a field the analyst simply never touched, which blocks the save on an
  // error no visible field can own, so nothing explains why nothing happens.
  .catchall(z.string().optional());
type DossierContentInput = z.infer<typeof dossierContentSchema>;

/**
 * Seed every declared field to "" (so a required field validates against our
 * message instead of a bare "Required", and dirty-tracking has a stable
 * baseline), then overlay the persisted content, which preserves the dynamic
 * `cond_*` and civilité keys the declared list does not know about.
 */
function buildDefaultValues(content: Record<string, string>): DossierContentInput {
  const seeded = Object.fromEntries(ALL_FIELDS.map((field) => [field.key, ""]));
  // The fee schedule's inputs are rendered unconditionally, so seed them too:
  // an unseeded Controller submits `undefined`, which dirty-tracking and the
  // resolver both handle worse than an empty string.
  const schedule = Object.fromEntries(
    FEE_LINES.flatMap((line) => ["taux", "min", "tva"].map((suffix) => [`${line.key}_${suffix}`, ""])),
  );
  return { ...seeded, ...schedule, ...content } as DossierContentInput;
}

/**
 * The civilité a signatory's live record carries today, matched on the nom/titre
 * pair the dossier stored when they were picked. A dossier keeps a copy of the
 * civilité (it must freeze with the rest of the content once finalized), but a
 * copy taken before the signatory's record was completed would otherwise stay
 * wrong forever, with no field in this form able to correct it.
 */
function liveCivilityOf(
  content: Record<string, string>,
  index: 1 | 2,
  options: SignatoryOption[] | undefined,
): string | null {
  const nom = content[`signataire${index}Nom`]?.trim();
  const titre = content[`signataire${index}Titre`]?.trim();
  if (!nom || !options?.length) return null;
  const match = options.find((option) => option.nom.trim() === nom && option.titre.trim() === titre);
  if (!match) return null;
  return match.civility ? CIVILITY_LABELS[match.civility] : "";
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
  if (field.type === "ouinon" || field.type === "civilite") {
    const choices = field.type === "ouinon" ? ["Oui", "Non"] : Object.values(CIVILITY_LABELS);
    return (
      <Select value={value || NO_ANSWER} onValueChange={(next) => onChange(next === NO_ANSWER ? "" : next)} disabled={disabled}>
        <SelectTrigger id={field.key} className="w-full" aria-invalid={invalid} aria-required={field.required}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_ANSWER}>Non renseigné</SelectItem>
          {choices.map((choice) => (
            <SelectItem key={choice} value={choice}>
              {choice}
            </SelectItem>
          ))}
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

/**
 * Shows which lot each line of the objet field lands on. The pairing is
 * positional, so a line inserted out of order would otherwise silently retitle
 * another lot's documents; spelling it out makes a mismatch obvious while typing.
 */
function ObjetLotPairing({ form }: { form: ReturnType<typeof useForm<DossierContentInput>> }) {
  const lots = parseLots(useWatch({ control: form.control, name: "lots" }) as string | undefined);
  const lines = ((useWatch({ control: form.control, name: "objetMarche" }) as string | undefined) ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lots.length < 2 || lines.length === 0) return null;

  return (
    <div className="sm:col-span-2 rounded-md border bg-muted/30 p-3 text-xs">
      <p className="font-medium text-foreground">Correspondance lot / objet</p>
      <ul className="mt-1.5 space-y-0.5">
        {lots.map((lot, index) => (
          <li key={lot} className={lines[index] ? "text-muted-foreground" : "text-destructive"}>
            <span className="font-medium">{lot}</span> → {lines[index] ?? "aucune ligne, reprendra la première"}
          </li>
        ))}
      </ul>
      {lines.length > lots.length && (
        <p className="mt-1.5 text-destructive">
          {lines.length - lots.length} ligne(s) en trop : il y a {lots.length} lots déclarés.
        </p>
      )}
      {lines.length === 1 && <p className="mt-1.5 text-muted-foreground">Une seule ligne : elle couvre tous les lots.</p>}
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
 * The dossier's fee schedule. Replaces the old per-lot amount grid: the analyst
 * states the rule once and every per-lot figure on the Fiche is computed from
 * the amounts already carried by the documents, so adding a lot no longer means
 * retyping four more numbers.
 */
function FeeScheduleFields({ form }: { form: ReturnType<typeof useForm<DossierContentInput>> }) {
  const values = useWatch({ control: form.control }) as Record<string, string | undefined>;

  /** The rule actually in force for a line: what was typed, else the bank's standard. */
  function effective(line: (typeof FEE_LINES)[number]) {
    const pick = (suffix: string, fallback: string) => (values[`${line.key}_${suffix}`] || "").trim() || fallback;
    const taux = pick("taux", line.taux);
    const min = pick("min", line.min);
    const tva = pick("tva", line.tva);
    const overridden =
      taux !== line.taux || min !== line.min || tva !== line.tva ? "dérogation sur ce dossier" : "barème standard";
    return { taux, min, tva, overridden };
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">Barème de conditions</p>
      <p className="text-xs text-muted-foreground">
        Chaque ligne est facturée max(montant du lot x taux, minimum) x (1 + TVA). Les montants par lot de la fiche et les
        conditions imprimées sur la notification en découlent, il n&apos;y a rien d&apos;autre à saisir.
      </p>
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Champs vides = barème standard de la banque</span>, rappelé sous chaque
        ligne. Ne saisissez une valeur que pour déroger au standard sur ce dossier précis.
      </p>
      <div className="space-y-4">
        {FEE_LINES.map((line) => (
          <div key={line.key} className="space-y-2 rounded-md border p-3">
            <p className="text-xs font-medium text-muted-foreground">
              {line.label} · assis sur {FEE_BASE_LABELS[line.base]}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  { suffix: "taux", label: "Taux (%)", fallback: line.taux },
                  { suffix: "min", label: "Minimum", fallback: line.min },
                  { suffix: "tva", label: "TVA (%)", fallback: line.tva },
                ] as const
              ).map((cell) => {
                const key = `${line.key}_${cell.suffix}`;
                return (
                  <Controller
                    key={key}
                    control={form.control}
                    name={key}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor={key}>{cell.label}</FieldLabel>
                        <Input
                          id={key}
                          inputMode="numeric"
                          placeholder={cell.fallback}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </Field>
                    )}
                  />
                );
              })}
            </div>
            {(() => {
              const rule = effective(line);
              return (
                <p className="text-xs text-muted-foreground">
                  En vigueur : {rule.taux}% Min GNF {rule.min} TTC {rule.tva}% · {rule.overridden}
                </p>
              );
            })()}
          </div>
        ))}
      </div>
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
  const { data: signatoryOptions } = useSignatoryOptions();
  const form = useForm<DossierContentInput>({
    resolver: zodResolver(dossierContentSchema),
    mode: "onTouched",
    defaultValues,
  });

  // Realign a stale civilité with the signatory's record. Done as a dirtying
  // edit rather than a silent default so the analyst sees there is something to
  // save (the header chip next to each signatory shows the resolved value) and
  // stays in control of when the dossier is rewritten.
  useEffect(() => {
    if (!open) return;
    for (const index of [1, 2] as const) {
      const live = liveCivilityOf(content, index, signatoryOptions);
      const key = `signataire${index}Civilite`;
      if (live !== null && live !== (content[key] ?? "")) {
        form.setValue(key, live, { shouldDirty: true });
      }
    }
  }, [open, content, signatoryOptions, form]);

  async function onSubmit(values: DossierContentInput) {
    // The backend stores a string map; drop any key the form left undefined.
    const content = Object.fromEntries(
      Object.entries(values).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
    try {
      await update.mutateAsync({ content });
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

  // Named, clickable list of what blocks the save. A required field can sit on a
  // tab the analyst is not looking at, so the inline error alone is invisible.
  const errorKeys = Object.keys(form.formState.errors).filter((key) => key !== "root");
  const missingFields = errorKeys
    .map((key) => ({ key, location: FIELD_LOCATION.get(key) }))
    .filter((entry): entry is { key: string; location: NonNullable<typeof entry.location> } => entry.location !== undefined);
  const sectionsWithErrors = new Set(missingFields.map((entry) => entry.location.sectionId));
  // An error on a key no visible field owns would otherwise block the save with
  // nothing on screen to explain it. Name the keys rather than stay silent.
  const unmappedErrorKeys = errorKeys.filter((key) => !FIELD_LOCATION.has(key));

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
                    {sectionsWithErrors.has(section.id) && (
                      <span aria-hidden className="ml-1.5 inline-block size-1.5 rounded-full bg-destructive align-middle" />
                    )}
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
                          {group.title === "Contexte du marché" && <ObjetLotPairing form={form} />}
                        </div>
                      )}
                    </div>
                  ))}

                  {section.id === "fiche" && <FeeScheduleFields form={form} />}
                </TabsContent>
              ))}
            </Tabs>

            {errorKeys.length > 0 && (
              <div role="alert" className="mt-4 rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm">
                <p className="font-medium text-destructive">
                  {errorKeys.length === 1
                    ? "1 champ obligatoire est manquant."
                    : `${errorKeys.length} champs obligatoires sont manquants.`}
                </p>
                {unmappedErrorKeys.length > 0 && (
                  <p className="mt-1 text-muted-foreground">Champs concernés : {unmappedErrorKeys.join(", ")}.</p>
                )}
                <ul className="mt-2 space-y-1">
                  {missingFields.map((entry) => (
                    <li key={entry.key}>
                      <button
                        type="button"
                        className="text-left underline underline-offset-2 hover:no-underline"
                        onClick={() => {
                          setActiveTab(entry.location.sectionId);
                          form.setFocus(entry.key);
                        }}
                      >
                        {entry.location.label}
                      </button>
                      <span className="text-muted-foreground"> · onglet {entry.location.sectionTitle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
