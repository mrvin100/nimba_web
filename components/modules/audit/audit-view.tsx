"use client";

import { useState } from "react";
import { ScrollText } from "lucide-react";
import { useAuditEvents } from "./useAudit";
import { auditColumns } from "./audit-columns";
import { DataTable } from "@/components/shared/data-table";
import { Pager } from "@/components/shared/pager";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

/** Admin audit trail: paginated list of recorded actions. */
export function AuditView() {
  const [page, setPage] = useState(0);
  const { data, isPending, isError } = useAuditEvents(page);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Journal d&apos;audit</h1>
        <p className="text-sm text-muted-foreground">Traçabilité des actions effectuées sur la plateforme</p>
      </div>

      {isPending ? (
        <div className="space-y-2" aria-busy>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">Impossible de charger le journal. Veuillez réessayer.</p>
      ) : data.content.length === 0 && page === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ScrollText />
            </EmptyMedia>
            <EmptyTitle>Aucune entrée</EmptyTitle>
            <EmptyDescription>Les actions apparaîtront ici au fur et à mesure.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={auditColumns}
            data={data.content}
            searchable
            searchPlaceholder="Rechercher (action, acteur, chemin)…"
            emptyMessage="Aucune entrée."
          />
          <Pager
            hasPrevious={data.hasPrevious}
            hasNext={data.hasNext}
            onPrevious={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => p + 1)}
          />
        </div>
      )}
    </div>
  );
}
