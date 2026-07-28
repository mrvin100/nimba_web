"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { CautionDossier } from "./schema";
import { DOSSIER_STATUS_LABELS } from "./schema";
import { Badge } from "@/components/ui/badge";

/** `clientName` comes from a client-side lookup (client list, capped at 200) — the same pattern the view already used. */
export function cautionDossierColumns(clientName: Map<string, string>): ColumnDef<CautionDossier>[] {
  return [
    {
      accessorKey: "referenceNumber",
      header: "Référence",
      meta: { label: "Référence" },
      cell: ({ row }) => <span className="font-medium">{row.original.referenceNumber}</span>,
    },
    {
      id: "client",
      header: "Client",
      meta: { label: "Client" },
      accessorFn: (dossier) => clientName.get(dossier.clientId) ?? "Client",
    },
    {
      accessorKey: "status",
      header: "Statut",
      meta: { label: "Statut" },
      cell: ({ row }) => (
        <Badge variant={row.original.status === "FINALISE" ? "secondary" : "default"}>
          {DOSSIER_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Créé le",
      meta: { label: "Créé le" },
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];
}
