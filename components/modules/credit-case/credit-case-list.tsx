"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, FolderOpen } from "lucide-react";
import { useWorkflowQueue, useWorkflowStatuses, type QueueItem, type WorkflowStatus } from "@/components/modules/workflow";
import { caseDetailPath, ROUTES } from "@/lib/constants";
import { useSession } from "@/components/modules/identity";
import { useCreditCases } from "./useCreditCase";
import { caseActionsColumn, creditCaseColumns } from "./credit-case-columns";
import type { CaseListFilter, CreditCaseSummary } from "./schema";
import { DataTable } from "@/components/shared/data-table";
import { Pager } from "@/components/shared/pager";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** The list's own filter, plus "queue" — a distinct data source (GET /workflow/queue), never sent to the credit-case list endpoint. */
type ViewFilter = CaseListFilter | "queue";

const FILTER_LABELS: Record<ViewFilter, string> = {
  queue: "En attente de ma revue",
  active: "Dossiers actifs",
  archived: "Dossiers archivés",
  all: "Tous les dossiers",
};

/** A queue item carries the same descriptive fields as a dossier row — status is unused by the columns (they read it from statusByCaseId instead). */
function toDossierRow(item: QueueItem): CreditCaseSummary {
  return {
    id: item.creditCaseId,
    caseNumber: item.caseNumber,
    clientId: item.clientId,
    clientName: item.clientName,
    productType: item.productType,
    contractType: item.contractType,
    status: "EN_ATTENTE_AMORTISSEMENT",
    createdAt: item.createdAt,
    archivedAt: null,
  };
}

/**
 * A direction's dossiers, one view instead of a separate review queue and full
 * list: [hasReviewQueue] directions (DCM, DRC, COMITE) default to "En attente de
 * ma revue" (GET /workflow/queue) with the option to switch to the full list;
 * DRI — which creates dossiers rather than reviewing them — has no queue concept
 * and keeps the plain active/archived/all filter it always had.
 */
export function CreditCaseList({
  workspaceBase = ROUTES.DRI,
  hasReviewQueue = false,
}: Readonly<{ workspaceBase?: string; hasReviewQueue?: boolean }>) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<ViewFilter>(hasReviewQueue ? "queue" : "active");
  const { isAdmin } = useSession();

  const isQueue = filter === "queue";
  const listFilter: CaseListFilter = isQueue ? "active" : filter;
  const list = useCreditCases(page, 20, listFilter, !isQueue);
  const queue = useWorkflowQueue(isQueue);

  const rows = useMemo(
    () => (isQueue ? (queue.data ?? []).map(toDossierRow) : (list.data?.content ?? [])),
    [isQueue, queue.data, list.data],
  );
  const isPending = isQueue ? queue.isPending : list.isPending;
  const isError = isQueue ? queue.isError : list.isError;

  // The dossier's real cross-directorate status, batched in one request for the
  // whole visible page — the queue already carries it inline, so only the plain
  // list needs the extra lookup.
  const caseIds = useMemo(() => (isQueue ? [] : rows.map((item) => item.id)), [isQueue, rows]);
  const { data: statuses } = useWorkflowStatuses(caseIds);
  const statusByCaseId = useMemo(() => {
    if (isQueue) return new Map<string, WorkflowStatus>((queue.data ?? []).map((item) => [item.creditCaseId, item.status]));
    return new Map<string, WorkflowStatus>(statuses?.map((item) => [item.creditCaseId, item.status]) ?? []);
  }, [isQueue, queue.data, statuses]);

  // The administrative actions (archive / delete) belong to platform admins;
  // everyone else keeps the plain columns.
  const columns = isAdmin ? [...creditCaseColumns(statusByCaseId), caseActionsColumn] : creditCaseColumns(statusByCaseId);

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

  if (rows.length === 0 && page === 0) {
    if (isQueue) {
      return (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>Aucun dossier en attente</EmptyTitle>
            <EmptyDescription>Les dossiers arrivant à votre étape de revue apparaîtront ici.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    }
    if (filter === "active") {
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
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={rows}
        emptyMessage={filter === "archived" ? "Aucun dossier archivé." : "Aucun dossier."}
        searchable
        searchPlaceholder="Rechercher un dossier…"
        onRowClick={(creditCase) => router.push(caseDetailPath(creditCase.id, workspaceBase))}
        toolbar={
          <Select
            value={filter}
            onValueChange={(value) => {
              setFilter(value as ViewFilter);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-48" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(FILTER_LABELS) as ViewFilter[])
                .filter((value) => value !== "queue" || hasReviewQueue)
                .map((value) => (
                  <SelectItem key={value} value={value}>
                    {FILTER_LABELS[value]}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        }
      />
      {!isQueue && list.data && (
        <Pager
          hasPrevious={list.data.hasPrevious}
          hasNext={list.data.hasNext}
          onPrevious={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => p + 1)}
          label={`${list.data.totalElements} dossier${list.data.totalElements > 1 ? "s" : ""} · page ${list.data.page + 1}/${Math.max(1, list.data.totalPages)}`}
        />
      )}
    </div>
  );
}
