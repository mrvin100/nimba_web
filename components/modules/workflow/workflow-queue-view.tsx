"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { caseDetailPath } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useWorkflowQueue } from "./useWorkflow";
import { WorkflowStatusBadge } from "./workflow-status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A direction's review queue: every dossier currently awaiting ITS turn — the
 * backend only returns dossiers at the caller's directions' review stages, so this
 * view never filters client-side. Mounted at each review workspace's root.
 */
export function WorkflowQueueView({ workspaceBase }: Readonly<{ workspaceBase: string }>) {
  const { data: queue, isPending, isError } = useWorkflowQueue();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      <PageHeader title="Dossiers à revoir" description="Dossiers en attente de votre revue." />

      {isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">Impossible de charger la file de revue. Veuillez réessayer.</p>
      ) : !queue || queue.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>Aucun dossier en attente</EmptyTitle>
            <EmptyDescription>Les dossiers arrivant à votre étape de revue apparaîtront ici.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {queue.map((item) => (
            <Link key={item.creditCaseId} href={caseDetailPath(item.creditCaseId, workspaceBase)}>
              <Card className="transition-colors hover:bg-accent/40">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{item.caseNumber}</CardTitle>
                      <CardDescription>{item.clientName}</CardDescription>
                    </div>
                    <WorkflowStatusBadge status={item.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Mis à jour le {formatDateTime(item.updatedAt)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
