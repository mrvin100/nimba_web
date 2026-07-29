"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { CreateClientDialog, useClients } from "@/components/modules/client";
import { clientColumns } from "./client-columns";
import { PageHeader } from "@/components/shared/page-header";
import { Pager } from "@/components/shared/pager";
import { DataTable } from "@/components/shared/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

/**
 * The client registry — every bank client, the entry point to a client's 360 view.
 * Shared by the DRI and DCM workspaces (both transact with clients); [workspaceBase]
 * scopes the links to the current workspace.
 */
export function ClientsRegistryView({ workspaceBase }: Readonly<{ workspaceBase: string }>) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const { data, isPending, isError } = useClients(page, 20);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      <PageHeader title="Clients" description="Chaque client de la banque, indépendamment des produits qu'il a souscrits.">
        <CreateClientDialog onCreated={(client) => router.push(`${workspaceBase}/clients/${client.id}`)} />
      </PageHeader>

      {isPending ? (
        <div className="space-y-2" aria-busy>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">Impossible de charger les clients. Veuillez réessayer.</p>
      ) : data.content.length === 0 && page === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 />
            </EmptyMedia>
            <EmptyTitle>Aucun client</EmptyTitle>
            <EmptyDescription>Enregistrez le premier client avec « Nouveau client ».</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={clientColumns}
            data={data.content}
            emptyMessage="Aucun client."
            searchable
            searchPlaceholder="Rechercher un client…"
            onRowClick={(client) => router.push(`${workspaceBase}/clients/${client.id}`)}
          />
          <Pager
            hasPrevious={data.hasPrevious}
            hasNext={data.hasNext}
            onPrevious={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => p + 1)}
            label={`${data.totalElements} client${data.totalElements > 1 ? "s" : ""} · page ${data.page + 1}/${Math.max(1, data.totalPages)}`}
          />
        </div>
      )}
    </div>
  );
}
