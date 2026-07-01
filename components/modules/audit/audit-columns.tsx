"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDateTime } from "@/lib/format";
import type { AuditEvent } from "./schema";
import { Badge } from "@/components/ui/badge";

export const auditColumns: ColumnDef<AuditEvent>[] = [
  {
    accessorKey: "occurredAt",
    header: "Date",
    meta: { label: "Date" },
    cell: ({ row }) => <span className="whitespace-nowrap">{formatDateTime(row.original.occurredAt)}</span>,
  },
  {
    accessorKey: "actorEmail",
    header: "Acteur",
    meta: { label: "Acteur" },
    cell: ({ row }) => row.original.actorEmail ?? "—",
  },
  {
    accessorKey: "action",
    header: "Action",
    meta: { label: "Action" },
    cell: ({ row }) => <span className="font-medium">{row.original.action}</span>,
  },
  {
    id: "request",
    header: "Requête",
    meta: { label: "Requête" },
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.method} {row.original.path}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    meta: { label: "Statut" },
    cell: ({ row }) => {
      const status = row.original.status;
      const variant = status >= 500 ? "destructive" : status >= 400 ? "secondary" : "default";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];
