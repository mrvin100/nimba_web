"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { AdminUser } from "./schema";
import { AccountStatusBadge, MembershipBadges } from "./admin-badges";
import { AdminUserActions } from "./admin-user-actions";

export const adminUserColumns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: "fullName",
    header: "Nom",
    cell: ({ row }) => <span className="font-medium">{row.original.fullName}</span>,
  },
  { accessorKey: "email", header: "E-mail" },
  {
    id: "access",
    header: "Accès",
    cell: ({ row }) => <MembershipBadges memberships={row.original.memberships} admin={row.original.admin} />,
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <AccountStatusBadge status={row.original.status} pending={row.original.pending} />,
  },
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
        <AdminUserActions user={row.original} />
      </div>
    ),
  },
];
