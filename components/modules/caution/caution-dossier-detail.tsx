"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleCheck, FileText, LockOpen, Pencil, RotateCcw, ScrollText } from "lucide-react";
import { useClients } from "@/components/modules/client";
import { useSession } from "@/components/modules/identity";
import { getErrorMessage } from "@/lib/api-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { ROUTES } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  useCautionDocumentTypes,
  useDossier,
  useDossierEvents,
  useFinalizeDossier,
  useProrogeDossier,
  useRefinalizeDossier,
} from "./useCaution";
import { DossierFieldsDialog } from "./dossier-fields-dialog";
import { CautionDocumentSection } from "./caution-document-section";
import { dossierFichePath, dossierNotificationPath } from "./caution.service";
import { DOSSIER_STATUS_LABELS } from "./schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

/**
 * The dossier workspace: its identity and lifecycle, the common information,
 * the companion documents, and one section (table) per document family. The
 * dossier is the aggregate root — finalizing locks everything; a manager can
 * proroge it to correct a single document, then re-finalize.
 */
export function CautionDossierDetailView({ dossierId }: { dossierId: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const [prorogeOpen, setProrogeOpen] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const session = useSession();
  const { data, isPending, isError } = useDossier(dossierId);
  const { data: documentTypes } = useCautionDocumentTypes();
  const { data: clients } = useClients(0, 200);
  const { data: events } = useDossierEvents(dossierId);
  const finalize = useFinalizeDossier(dossierId);
  const refinalize = useRefinalizeDossier(dossierId);

  const clientName = useMemo(() => {
    const map = new Map<string, string>();
    (clients?.content ?? []).forEach((client) => map.set(client.id, client.raisonSociale));
    return map;
  }, [clients]);

  const backLink = (
    <Link
      href={`${ROUTES.DCM}/caution-dossiers`}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Dossiers de caution
    </Link>
  );

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
        {backLink}
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
        {backLink}
        <p className="text-sm text-destructive">Impossible de charger le dossier. Veuillez réessayer.</p>
      </div>
    );
  }

  const { dossier, documents } = data;
  const writable = dossier.status !== "FINALISE";
  const isManager = session.isManager("DCM");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      {backLink}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{dossier.referenceNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {clientName.get(dossier.clientId) ?? "Client"} · version {dossier.version} · créé le {formatDate(dossier.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={dossier.status === "FINALISE" ? "secondary" : "default"}>{DOSSIER_STATUS_LABELS[dossier.status]}</Badge>
          {writable && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil />
              Informations du dossier
            </Button>
          )}
          {dossier.status === "BROUILLON" && (
            <Button size="sm" onClick={() => setConfirmFinalize(true)}>
              <CircleCheck />
              Finaliser la demande
            </Button>
          )}
          {dossier.status === "FINALISE" && isManager && (
            <Button variant="outline" size="sm" onClick={() => setProrogeOpen(true)}>
              <LockOpen />
              Proroger
            </Button>
          )}
          {dossier.status === "EN_PROROGATION" && (
            <Button size="sm" onClick={() => refinalize.mutate()}>
              <RotateCcw />
              Re-finaliser
            </Button>
          )}
        </div>
      </div>

      <section className="space-y-3 rounded-md border p-4">
        <h2 className="text-sm font-semibold">Documents d&apos;accompagnement</h2>
        <p className="text-sm text-muted-foreground">
          Générés à partir des informations du dossier (version {dossier.version}), ils accompagnent toute caution de soumission.
        </p>
        <div className="flex flex-wrap gap-2">
          <a href={dossierFichePath(dossier.id)} download className={buttonVariants({ variant: "outline", size: "sm" })}>
            <FileText />
            Fiche d&apos;approbation (.docx)
          </a>
          <a href={dossierNotificationPath(dossier.id)} download className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ScrollText />
            Notification (.docx)
          </a>
        </div>
      </section>

      {(documentTypes ?? []).map((type) => (
        <CautionDocumentSection
          key={type.code}
          dossierId={dossier.id}
          clientId={dossier.clientId}
          documentType={type.code}
          typeLabel={`${type.label} (${type.code})`}
          specificFields={type.specificFields}
          documents={documents.filter((document) => document.documentType === type.code)}
          commonContent={dossier.content}
          writable={writable}
          requireReasonOnEdit={dossier.status === "EN_PROROGATION"}
        />
      ))}

      {events && events.length > 0 && (
        <section className="space-y-2 rounded-md border p-4">
          <h2 className="text-sm font-semibold">Journal du dossier</h2>
          <ul className="space-y-1 text-sm">
            {events.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
                <span className="font-medium text-foreground">{DOSSIER_STATUS_LABELS[event.toStatus]}</span>
                <span>· {formatDateTime(event.createdAt)}</span>
                {event.reason && <span>· {event.reason}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <DossierFieldsDialog dossierId={dossier.id} content={dossier.content} open={editOpen} onOpenChange={setEditOpen} />
      <ProrogeDialog dossierId={dossier.id} open={prorogeOpen} onOpenChange={setProrogeOpen} />

      <AlertDialog open={confirmFinalize} onOpenChange={setConfirmFinalize}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finaliser la demande {dossier.referenceNumber} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tous les documents seront figés et le dossier verrouillé. Seule une prorogation (par un manager) permettra ensuite
              de corriger un document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => finalize.mutate()}>Finaliser</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Reason-capture dialog for a prorogation (manager-only, journaled). */
function ProrogeDialog({ dossierId, open, onOpenChange }: { dossierId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const proroge = useProrogeDossier(dossierId);
  const [reason, setReason] = useState("");
  const [rootError, setRootError] = useState<string | null>(null);

  async function handleSubmit() {
    setRootError(null);
    try {
      await proroge.mutateAsync(reason.trim());
      setReason("");
      onOpenChange(false);
    } catch (error) {
      setRootError(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Proroger le dossier</DialogTitle>
          <DialogDescription>Le dossier sera déverrouillé pour correction. Le motif est journalisé.</DialogDescription>
        </DialogHeader>
        <Field data-invalid={Boolean(rootError)}>
          <FieldLabel htmlFor="proroge-reason">Motif de la prorogation</FieldLabel>
          <Textarea id="proroge-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          {rootError && <FieldError errors={[{ message: rootError }]} />}
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </DialogClose>
          <SubmitButton
            formState={{ isSubmitting: proroge.isPending }}
            disabled={reason.trim().length === 0}
            pendingLabel="Prorogation en cours"
            onClick={handleSubmit}
          >
            Proroger
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
