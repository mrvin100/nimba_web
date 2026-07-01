"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import { AccountStatusBadge } from "@/components/modules/admin";
import type { TeamMember } from "./schema";
import { MemberActions } from "./member-actions";

export const teamMemberColumns: ColumnDef<TeamMember>[] = [
  {
    accessorKey: "fullName",
    header: "Nom",
    cell: ({ row }) => <span className="font-medium">{row.original.fullName}</span>,
  },
  { accessorKey: "email", header: "E-mail" },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <AccountStatusBadge status={row.original.status} pending={row.original.pending} />,
  },
  {
    accessorKey: "createdAt",
    header: "Ajouté le",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: "",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-right">
        <MemberActions member={row.original} />
      </div>
    ),
  },
];
