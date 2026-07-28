"use client";

import { useSignatories } from "./useSignatory";
import { CreateSignatoryDialog } from "./create-signatory-dialog";
import { signatoryColumns } from "./signatory-columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Standalone signatories (no user account) — a user with an account opts in on
 * their own profile instead, and needs no admin action here.
 */
export function SignatoryManagementCard() {
  const { data, isPending, isError } = useSignatories();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Signataires sans compte</CardTitle>
          <CardDescription>
            Pour une personne sans profil dans le système. Un utilisateur avec un compte devient signataire depuis son
            propre profil.
          </CardDescription>
        </div>
        <CreateSignatoryDialog />
      </CardHeader>
      <CardContent>
        {isPending ? (
          <Skeleton className="h-48 w-full" />
        ) : isError ? (
          <p className="text-sm text-destructive">Impossible de charger les signataires. Veuillez réessayer.</p>
        ) : (
          <DataTable
            columns={signatoryColumns}
            data={data}
            searchable
            searchPlaceholder="Rechercher un signataire…"
            emptyMessage="Aucun signataire sans compte pour le moment."
          />
        )}
      </CardContent>
    </Card>
  );
}
