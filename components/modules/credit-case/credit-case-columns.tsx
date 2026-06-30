"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { CreditCaseSummary } from "./credit-case-schemas";
import { CreditCaseStatusBadge } from "./credit-case-status-badge";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

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
    cell: ({ row }) => dateFormat.format(new Date(row.original.createdAt)),
  },
];
