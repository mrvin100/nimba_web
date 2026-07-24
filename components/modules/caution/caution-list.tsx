"use client";

import { useState } from "react";
import { FileStack } from "lucide-react";
import { cautionColumns } from "./caution-columns";
import { useCautions } from "./useCaution";
import { DataTable } from "@/components/shared/data-table";
import { Pager } from "@/components/shared/pager";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

/** The Cautions data table — same list UX as the credit-case dossiers (sorting, pagination, search, actions). */
export function CautionList() {
  const [page, setPage] = useState(0);
  const { data, isPending, isError } = useCautions(page, 20);

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
    return <p className="text-sm text-destructive">Impossible de charger les cautions. Veuillez réessayer.</p>;
  }

  if (data.content.length === 0 && page === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileStack />
          </EmptyMedia>
          <EmptyTitle>Aucune caution</EmptyTitle>
          <EmptyDescription>Les cautions et attestations générées pour vos clients apparaîtront ici.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={cautionColumns}
        data={data.content}
        emptyMessage="Aucune caution."
        searchable
        searchPlaceholder="Rechercher une caution"
      />
      <Pager
        hasPrevious={data.hasPrevious}
        hasNext={data.hasNext}
        onPrevious={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        label={`${data.totalElements} caution${data.totalElements > 1 ? "s" : ""} · page ${data.page + 1}/${Math.max(1, data.totalPages)}`}
      />
    </div>
  );
}
