"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { useClients } from "@/components/modules/client";
import { PageHeader } from "@/components/shared/page-header";
import { Pager } from "@/components/shared/pager";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useDossiers } from "./useCaution";
import { CreateDossierDialog } from "./create-dossier-dialog";
import { DOSSIER_STATUS_LABELS } from "./schema";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

/** DCM's dossiers workspace: each dossier groups a client's caution request with its companion documents. */
export function CautionDossiersView() {
  const [page, setPage] = useState(0);
  const { data, isPending, isError } = useDossiers(page, 20);
  const { data: clients } = useClients(0, 200);

  const clientName = useMemo(() => {
    const map = new Map<string, string>();
    (clients?.content ?? []).forEach((client) => map.set(client.id, client.raisonSociale));
    return map;
  }, [clients]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      <PageHeader
        title="Dossiers de caution"
        description="Regroupez les cautions, attestations et documents d'une demande client, avec sa fiche d'approbation et sa notification."
      >
        <CreateDossierDialog />
      </PageHeader>

      {isPending ? (
        <div className="space-y-2" aria-busy>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">Impossible de charger les dossiers. Veuillez réessayer.</p>
      ) : data.content.length === 0 && page === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen />
            </EmptyMedia>
            <EmptyTitle>Aucun dossier</EmptyTitle>
            <EmptyDescription>Créez un dossier pour regrouper les documents d&apos;une demande de caution.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          <div className="divide-y overflow-hidden rounded-md border">
            {data.content.map((dossier) => (
              <Link
                key={dossier.id}
                href={`${ROUTES.DCM}/caution-dossiers/${dossier.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{dossier.referenceNumber}</p>
                  <p className="truncate text-xs text-muted-foreground">{clientName.get(dossier.clientId) ?? "Client"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant={dossier.status === "OPEN" ? "default" : "secondary"}>
                    {DOSSIER_STATUS_LABELS[dossier.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(dossier.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
          <Pager
            hasPrevious={data.hasPrevious}
            hasNext={data.hasNext}
            onPrevious={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => p + 1)}
            label={`${data.totalElements} dossier${data.totalElements > 1 ? "s" : ""} · page ${data.page + 1}/${Math.max(1, data.totalPages)}`}
          />
        </div>
      )}
    </div>
  );
}
