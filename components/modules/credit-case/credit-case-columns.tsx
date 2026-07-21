"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { WorkflowStatusBadge, type WorkflowStatus } from "@/components/modules/workflow";
import { formatDate } from "@/lib/format";
import type { CreditCaseSummary } from "./schema";
import { CaseActionMenu } from "./case-action-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * `statusByCaseId` comes from the workflow module's batch lookup (one request
 * for the whole page, not one per row) — a factory rather than a constant so
 * the list can pass it in once it has resolved. Missing (still loading, or a
 * dossier the workflow module has no row for yet) renders a skeleton rather
 * than nothing, since a blank cell reads as a bug, not as "loading".
 */
export function creditCaseColumns(statusByCaseId: Map<string, WorkflowStatus>): ColumnDef<CreditCaseSummary>[] {
  return [
    {
      accessorKey: "caseNumber",
      header: "N° dossier",
      cell: ({ row }) => <span className="font-medium">{row.original.caseNumber}</span>,
    },
    { accessorKey: "clientName", header: "Client" },
    { accessorKey: "productType", header: "Produit" },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = statusByCaseId.get(row.original.id);
        return (
          <span className="inline-flex items-center gap-1.5">
            {status ? <WorkflowStatusBadge status={status} /> : <Skeleton className="h-5 w-24" />}
            {row.original.archivedAt !== null && <Badge variant="outline">Archivé</Badge>}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Créé le",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];
}

/**
 * Administrative actions column, appended by the list only for platform admins —
 * everyone else gets exactly the columns above.
 */
export const caseActionsColumn: ColumnDef<CreditCaseSummary> = {
  id: "actions",
  header: "",
  enableHiding: false,
  cell: ({ row }) => (
    <div className="text-right">
      <CaseActionMenu creditCase={row.original} />
    </div>
  ),
};
