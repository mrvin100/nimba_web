"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import { SIGNATORY_CATEGORY_LABELS, type Signatory } from "./schema";
import { SignatoryRowActions } from "./signatory-row-actions";
import { CIVILITY_LABELS } from "@/components/modules/identity";
import { Badge } from "@/components/ui/badge";

const ROLE_LABELS = { MANAGER: "Manager", MEMBER: "Membre" } as const;

export const signatoryColumns: ColumnDef<Signatory>[] = [
  {
    accessorKey: "nom",
    header: "Nom",
    meta: { label: "Nom" },
    cell: ({ row }) => <span className="font-medium">{row.original.nom}</span>,
  },
  {
    accessorKey: "titre",
    header: "Titre",
    meta: { label: "Titre" },
  },
  {
    accessorKey: "civility",
    header: "Civilité",
    meta: { label: "Civilité" },
    cell: ({ row }) => CIVILITY_LABELS[row.original.civility],
  },
  {
    accessorKey: "category",
    header: "Catégorie",
    meta: { label: "Catégorie" },
    cell: ({ row }) => <Badge variant="outline">{SIGNATORY_CATEGORY_LABELS[row.original.category]}</Badge>,
  },
  {
    id: "scope",
    header: "Portée",
    meta: { label: "Portée" },
    cell: ({ row }) => {
      const authorizations = row.original.authorizations;
      if (authorizations.length === 0) {
        return <Badge variant="secondary">Global</Badge>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {authorizations.map((a) => (
            <Badge key={`${a.department}-${a.departmentRole}`} variant="secondary">
              {a.department} {ROLE_LABELS[a.departmentRole]}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "creationReason",
    header: "Motif",
    meta: { label: "Motif" },
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.creationReason}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Créé le",
    meta: { label: "Créé le" },
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: "",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-right">
        <SignatoryRowActions signatory={row.original} />
      </div>
    ),
  },
];
