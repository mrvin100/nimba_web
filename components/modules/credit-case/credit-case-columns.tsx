"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { CreditCaseSummary } from "./schema";
import { CreditCaseStatusBadge } from "./credit-case-status-badge";
import { CaseActionMenu } from "./case-action-menu";
import { Badge } from "@/components/ui/badge";

export const creditCaseColumns: ColumnDef<CreditCaseSummary>[] = [
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
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1.5">
        <CreditCaseStatusBadge status={row.original.status} />
        {row.original.archivedAt !== null && <Badge variant="outline">Archivé</Badge>}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Créé le",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

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
