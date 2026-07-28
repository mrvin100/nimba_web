"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ClientSummary } from "@/components/modules/client";

export const clientColumns: ColumnDef<ClientSummary>[] = [
  {
    accessorKey: "raisonSociale",
    header: "Raison sociale",
    meta: { label: "Raison sociale" },
    cell: ({ row }) => <span className="font-medium">{row.original.raisonSociale}</span>,
  },
  {
    accessorKey: "matricule",
    header: "Matricule",
    meta: { label: "Matricule" },
    cell: ({ row }) => row.original.matricule ?? "—",
  },
  {
    accessorKey: "agence",
    header: "Agence",
    meta: { label: "Agence" },
    cell: ({ row }) => row.original.agence ?? "—",
  },
];
