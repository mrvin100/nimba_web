"use client";

import { useState } from "react";
import { useAdminUsers } from "./useAdmin";
import { adminUserColumns } from "./admin-columns";
import { DataTable } from "@/components/shared/data-table";
import { Pager } from "@/components/shared/pager";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export function AdminUsersTable() {
  const [page, setPage] = useState(0);
  const { data, isPending, isError } = useAdminUsers(page);

  if (isPending) {
    return (
      <div className="space-y-2" aria-busy>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">Impossible de charger les utilisateurs. Veuillez réessayer.</p>;
  }

  if (data.content.length === 0 && page === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>Aucun utilisateur</EmptyTitle>
          <EmptyDescription>Créez le premier compte avec « Nouvel utilisateur ».</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={adminUserColumns}
        data={data.content}
        emptyMessage="Aucun utilisateur."
        searchable
        searchPlaceholder="Rechercher un utilisateur…"
      />
      <Pager
        hasPrevious={data.hasPrevious}
        hasNext={data.hasNext}
        onPrevious={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => p + 1)}
      />
    </div>
  );
}
