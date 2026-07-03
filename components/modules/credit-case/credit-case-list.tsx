"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { caseDetailPath } from "@/lib/constants";
import { useCreditCases } from "./useCreditCase";
import { creditCaseColumns } from "./credit-case-columns";
import { DataTable } from "@/components/shared/data-table";
import { Pager } from "@/components/shared/pager";
import { FolderOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

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
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen />
          </EmptyMedia>
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
        searchable
        searchPlaceholder="Rechercher un dossier…"
        onRowClick={(creditCase) => router.push(caseDetailPath(creditCase.id))}
      />
      <Pager
        hasPrevious={data.hasPrevious}
        hasNext={data.hasNext}
        onPrevious={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        label={`${data.totalElements} dossier${data.totalElements > 1 ? "s" : ""} · page ${data.page + 1}/${Math.max(1, data.totalPages)}`}
      />
    </div>
  );
}
