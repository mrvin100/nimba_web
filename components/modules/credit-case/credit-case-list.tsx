"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { caseDetailPath } from "@/lib/constants";
import { useCreditCases } from "./credit-case-hooks";
import { creditCaseColumns } from "./credit-case-columns";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export function CreditCaseList() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const { data, isPending, isError } = useCreditCases(page);

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
    return <p className="text-sm text-destructive">Impossible de charger les dossiers. Veuillez réessayer.</p>;
  }

  if (data.content.length === 0 && page === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Aucun dossier</EmptyTitle>
          <EmptyDescription>Créez votre premier dossier de crédit avec « Nouveau dossier ».</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={creditCaseColumns}
        data={data.content}
        emptyMessage="Aucun dossier."
        onRowClick={(creditCase) => router.push(caseDetailPath(creditCase.id))}
      />
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" disabled={!data.hasPrevious} onClick={() => setPage((p) => Math.max(0, p - 1))}>
          Précédent
        </Button>
        <Button variant="outline" size="sm" disabled={!data.hasNext} onClick={() => setPage((p) => p + 1)}>
          Suivant
        </Button>
      </div>
    </div>
  );
}
