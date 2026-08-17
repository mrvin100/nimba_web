"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { ClientPicker } from "@/components/modules/client";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { ROUTES } from "@/lib/constants";
import { useCreateDossier, useNextDossierSequence } from "./useCaution";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const createDossierFormSchema = z.object({
  clientId: z.string().min(1, "Choisissez un client."),
  sequence: z
    .string()
    .trim()
    .min(1, "Le numéro de référence est requis.")
    .regex(/^\d+$/, "Le numéro de référence doit être composé uniquement de chiffres."),
  beneficiaire: z.string().trim().min(1, "Indiquez le bénéficiaire (maître d'ouvrage)."),
  referenceAppelOffres: z.string().trim().min(1, "Indiquez la référence de l'appel d'offres."),
  numeroCompte: z.string().trim().min(1, "Indiquez le numéro de compte sur lequel cette demande est adossée."),
  objetMarche: z.string().trim().optional(),
});

type CreateDossierFormInput = z.infer<typeof createDossierFormSchema>;

/**
 * Opens a dossier de caution de soumission with its market context. The rest of
 * the dossier's fields (notification, fiche) are filled afterwards on the
 * detail page, then its documents are attached and the companions downloaded.
 */
export function CreateDossierDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const createDossier = useCreateDossier();
  const { data: suggestedSequence } = useNextDossierSequence(open);

  const form = useForm<CreateDossierFormInput>({
    resolver: zodResolver(createDossierFormSchema),
    mode: "onTouched",
    defaultValues: { clientId: "", sequence: "", beneficiaire: "", referenceAppelOffres: "", numeroCompte: "", objetMarche: "" },
  });

  function onOpenChange(next: boolean) {
    if (next) {
      form.reset({ clientId: "", sequence: "", beneficiaire: "", referenceAppelOffres: "", numeroCompte: "", objetMarche: "" });
    }
    setOpen(next);
  }

  // The suggestion loads asynchronously right after the dialog opens; fill it
  // in once it arrives, but never clobber a value the analyst already touched.
  useEffect(() => {
    if (open && suggestedSequence && !form.formState.dirtyFields.sequence) {
      form.setValue("sequence", String(suggestedSequence.sequence));
    }
  }, [open, suggestedSequence, form]);

  async function onSubmit(values: CreateDossierFormInput) {
    try {
      const created = await createDossier.mutateAsync({
        clientId: values.clientId,
        sequence: Number(values.sequence),
        content: {
          beneficiaire: values.beneficiaire,
          referenceAppelOffres: values.referenceAppelOffres,
          numeroCompte: values.numeroCompte,
          objetMarche: values.objetMarche ?? "",
        },
      });
      setOpen(false);
      router.push(`${ROUTES.DCM}/cautions/${created.id}`);
    } catch (error) {
      form.setError("root", { message: getErrorMessage(error) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nouveau dossier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95vw] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Nouveau dossier de caution</DialogTitle>
          <DialogDescription>
            Un dossier regroupe les documents d&apos;une demande client pour un appel d&apos;offres, avec sa fiche
            d&apos;approbation et sa notification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="contents">
          <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
            <FieldGroup>
              <Controller
                control={form.control}
                name="clientId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Client
                      <RequiredMark />
                    </FieldLabel>
                    <ClientPicker value={field.value || null} onChange={field.onChange} workspaceBase={ROUTES.DCM} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="sequence"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Numéro de référence
                      <RequiredMark />
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      inputMode="numeric"
                      aria-invalid={fieldState.invalid}
                      aria-required
                    />
                    <FieldDescription>
                      Propre à la série des dossiers (DOS) ; pré-rempli avec le prochain numéro libre, modifiable si besoin.
                      Verrouillé une fois le dossier finalisé.
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="beneficiaire"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Bénéficiaire (Maître d&apos;ouvrage)
                      <RequiredMark />
                    </FieldLabel>
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} aria-required />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="referenceAppelOffres"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Référence de l&apos;appel d&apos;offres
                      <RequiredMark />
                    </FieldLabel>
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} aria-required />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="numeroCompte"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Numéro de compte
                      <RequiredMark />
                    </FieldLabel>
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} aria-required />
                    <FieldDescription>Le compte sur lequel cette demande de caution est adossée.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="objetMarche"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Objet du marché</FieldLabel>
                    <Textarea {...field} id={field.name} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              {form.formState.errors.root && (
                <Field data-invalid>
                  <FieldError errors={[form.formState.errors.root]} />
                </Field>
              )}
            </FieldGroup>
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <SubmitButton formState={{ isSubmitting: createDossier.isPending }} pendingLabel="Création en cours">
              Créer le dossier
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
