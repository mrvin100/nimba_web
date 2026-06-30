"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { CreditCaseSummary } from "./schema";
import { CreditCaseStatusBadge } from "./credit-case-status-badge";

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
    cell: ({ row }) => <CreditCaseStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: "Créé le",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];
