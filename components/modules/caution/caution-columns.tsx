"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { CautionSummary } from "./schema";
import { cautionDocxExportPath } from "./caution.service";
import { CautionDocumentTypeBadge } from "./caution-document-type-badge";
import { CautionStatusBadge } from "./caution-status-badge";
import { buttonVariants } from "@/components/ui/button";

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
      <div className="text-right" onClick={(event) => event.stopPropagation()}>
        <a
          href={cautionDocxExportPath(row.original.id)}
          download
          className={buttonVariants({ variant: "ghost", size: "icon" })}
          aria-label="Télécharger le document"
        >
          <Download className="size-4" />
        </a>
      </div>
    ),
  },
];
