"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { CautionSummary } from "./schema";
import { CautionActionMenu } from "./caution-action-menu";
import { CautionDocumentTypeBadge } from "./caution-document-type-badge";
import { CautionStatusBadge } from "./caution-status-badge";

export const cautionColumns: ColumnDef<CautionSummary>[] = [
  {
    accessorKey: "referenceNumber",
    header: "Référence",
    cell: ({ row }) => <span className="font-medium">{row.original.referenceNumber}</span>,
  },
  {
    accessorKey: "clientRaisonSociale",
    header: "Client",
    cell: ({ row }) => (
      <div>
        <p>{row.original.clientRaisonSociale}</p>
        <p className="text-xs text-muted-foreground">{row.original.clientMatricule}</p>
      </div>
    ),
  },
  {
    accessorKey: "documentType",
    header: "Type",
    cell: ({ row }) => <CautionDocumentTypeBadge documentType={row.original.documentType} />,
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <CautionStatusBadge status={row.original.status} />,
  },
  { accessorKey: "createdByName", header: "Créé par" },
  {
    accessorKey: "createdAt",
    header: "Créé le",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: "",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-right">
        <CautionActionMenu caution={row.original} />
      </div>
    ),
  },
];
