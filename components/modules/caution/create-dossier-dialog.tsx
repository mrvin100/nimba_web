"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ClientPicker } from "@/components/modules/client";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { ROUTES } from "@/lib/constants";
import { useCreateDossier, useReferenceSequenceStatus } from "./useCaution";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * Opens a dossier de caution de soumission with its market context. The rest of
 * the dossier's fields (notification, fiche) are filled afterwards on the
 * detail page, then its documents are attached and the companions downloaded.
 */
export function CreateDossierDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [beneficiaire, setBeneficiaire] = useState("");
  const [referenceAppelOffres, setReferenceAppelOffres] = useState("");
  const [objetMarche, setObjetMarche] = useState("");
  const [startingSequence, setStartingSequence] = useState("");
  const [rootError, setRootError] = useState<string | null>(null);
  const { data: referenceSequenceStatus } = useReferenceSequenceStatus();
  const createDossier = useCreateDossier();

  const showStartingSequence = referenceSequenceStatus?.initialized === false;
  const canSubmit = Boolean(clientId) && beneficiaire.trim().length > 0 && referenceAppelOffres.trim().length > 0;

  function reset() {
    setClientId(null);
    setBeneficiaire("");
    setReferenceAppelOffres("");
    setObjetMarche("");
    setStartingSequence("");
    setRootError(null);
  }

  async function handleSubmit() {
    if (!clientId) return;
    setRootError(null);
    try {
      const created = await createDossier.mutateAsync({
        clientId,
        content: { beneficiaire, referenceAppelOffres, objetMarche },
        startingReferenceSequence: showStartingSequence && startingSequence.trim() ? Number(startingSequence) : undefined,
      });
      setOpen(false);
      reset();
      router.push(`${ROUTES.DCM}/caution-dossiers/${created.id}`);
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

        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
          <FieldGroup>
            <Field>
              <FieldLabel>Client</FieldLabel>
              <ClientPicker value={clientId} onChange={setClientId} />
            </Field>
            <Field>
              <FieldLabel htmlFor="dossier-beneficiaire">Bénéficiaire (Maître d&apos;ouvrage)</FieldLabel>
              <Input id="dossier-beneficiaire" value={beneficiaire} onChange={(e) => setBeneficiaire(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="dossier-reference">Référence de l&apos;appel d&apos;offres</FieldLabel>
              <Input
                id="dossier-reference"
                value={referenceAppelOffres}
                onChange={(e) => setReferenceAppelOffres(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="dossier-objet">Objet du marché</FieldLabel>
              <Textarea id="dossier-objet" value={objetMarche} onChange={(e) => setObjetMarche(e.target.value)} />
            </Field>
            {showStartingSequence && (
              <Field>
                <FieldLabel htmlFor="dossier-starting-sequence">Numéro de départ (première référence)</FieldLabel>
                <Input
                  id="dossier-starting-sequence"
                  type="number"
                  min={1}
                  placeholder="Pour reprendre la numérotation papier existante"
                  value={startingSequence}
                  onChange={(e) => setStartingSequence(e.target.value)}
                />
              </Field>
            )}
            {rootError && (
              <Field data-invalid>
                <FieldError errors={[{ message: rootError }]} />
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
          <SubmitButton
            formState={{ isSubmitting: createDossier.isPending }}
            disabled={!canSubmit}
            pendingLabel="Création en cours"
            onClick={handleSubmit}
          >
            Créer le dossier
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
