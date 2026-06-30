"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { AdminUser } from "./admin-schemas";
import { AccountStatusBadge, MembershipBadges } from "./admin-badges";
import { AdminUserActions } from "./admin-user-actions";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

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
    cell: ({ row }) => <AccountStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: "Créé le",
    cell: ({ row }) => dateFormat.format(new Date(row.original.createdAt)),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="text-right">
        <AdminUserActions user={row.original} />
      </div>
    ),
  },
];
