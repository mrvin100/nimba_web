"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText, Pencil, ScrollText } from "lucide-react";
import { useClients } from "@/components/modules/client";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { dossierKeys, useDossier } from "./useCaution";
import { CreateCautionDialog } from "./create-caution-dialog";
import { DossierFieldsDialog } from "./dossier-fields-dialog";
import { CautionDocumentTypeBadge } from "./caution-document-type-badge";
import { CautionStatusBadge } from "./caution-status-badge";
import { cautionDocxExportPath, dossierFichePath, dossierNotificationPath } from "./caution.service";
import { DOSSIER_STATUS_LABELS } from "./schema";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A dossier's detail: its identity and status, the two companion documents
 * (fiche + notification) to download, the documents attached to it, and the
 * action to attach a new one or edit the shared information.
 */
export function CautionDossierDetailView({ dossierId }: { dossierId: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useDossier(dossierId);
  const { data: clients } = useClients(0, 200);

  function refreshDossier() {
    queryClient.invalidateQueries({ queryKey: dossierKeys.detail(dossierId) });
  }

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

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      {backLink}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{dossier.referenceNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {clientName.get(dossier.clientId) ?? "Client"} · créé le {formatDate(dossier.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={dossier.status === "OPEN" ? "default" : "secondary"}>{DOSSIER_STATUS_LABELS[dossier.status]}</Badge>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil />
            Informations du dossier
          </Button>
        </div>
      </div>

      <section className="space-y-3 rounded-md border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Documents d&apos;accompagnement</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Générés à partir des informations du dossier, ils accompagnent toute demande de caution de soumission.
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

      <section className="space-y-3 rounded-md border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Documents du dossier</h2>
          <CreateCautionDialog
            presetClientId={dossier.clientId}
            dossierId={dossier.id}
            triggerLabel="Ajouter un document"
            onCreated={refreshDossier}
          />
        </div>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun document attaché pour le moment.</p>
        ) : (
          <div className="divide-y">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between gap-4 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <CautionDocumentTypeBadge documentType={document.documentType} />
                  <span className="truncate text-sm">{document.referenceNumber}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <CautionStatusBadge status={document.status} />
                  <a
                    href={cautionDocxExportPath(document.id)}
                    download
                    className={buttonVariants({ variant: "ghost", size: "icon" })}
                    aria-label="Télécharger le document"
                  >
                    <Download className="size-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <DossierFieldsDialog dossierId={dossier.id} content={dossier.content} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
