"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { caseDetailPath } from "@/lib/constants";
import { useSession } from "@/components/modules/identity";
import { useCreditCases } from "./useCreditCase";
import { caseActionsColumn, creditCaseColumns } from "./credit-case-columns";
import type { CaseListFilter } from "./schema";
import { DataTable } from "@/components/shared/data-table";
import { Pager } from "@/components/shared/pager";
import { FolderOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FILTER_LABELS: Record<CaseListFilter, string> = {
  active: "Dossiers actifs",
  archived: "Dossiers archivés",
  all: "Tous les dossiers",
};

export function CreditCaseList() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<CaseListFilter>("active");
  const { data, isPending, isError } = useCreditCases(page, 20, filter);
  const { isAdmin } = useSession();

  // The administrative actions (archive / delete) belong to platform admins;
  // everyone else keeps the plain columns.
  const columns = isAdmin ? [...creditCaseColumns, caseActionsColumn] : creditCaseColumns;

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

  if (data.content.length === 0 && page === 0 && filter === "active") {
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
        columns={columns}
        data={data.content}
        emptyMessage={filter === "archived" ? "Aucun dossier archivé." : "Aucun dossier."}
        searchable
        searchPlaceholder="Rechercher un dossier…"
        onRowClick={(creditCase) => router.push(caseDetailPath(creditCase.id))}
        toolbar={
          <Select
            value={filter}
            onValueChange={(value) => {
              setFilter(value as CaseListFilter);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-44" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(FILTER_LABELS) as CaseListFilter[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {FILTER_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
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
