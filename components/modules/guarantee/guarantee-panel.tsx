"use client";

import { ShieldCheck } from "lucide-react";
import { useSession } from "@/components/modules/identity";
import { isDriEditable, useWorkflowState } from "@/components/modules/workflow";
import { CreateGuaranteeDialog } from "./create-guarantee-dialog";
import { GuaranteeCard } from "./guarantee-card";
import { useGuarantees } from "./useGuarantee";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A dossier's guarantees — bound into the FA, the PV and the FMP. DRI-only
 * mutations, and only while the dossier is still theirs to constitute.
 */
export function GuaranteePanel({ caseId }: Readonly<{ caseId: string }>) {
  const { data: guarantees, isPending, isError } = useGuarantees(caseId);
  const { data: workflowState } = useWorkflowState(caseId);
  const session = useSession();
  const canEdit = session.hasDepartment("DRI") && isDriEditable(workflowState?.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-base">Garanties</CardTitle>
            <CardDescription>Réutilisées sur la fiche d&apos;analyse, le PV et la fiche de mise en place.</CardDescription>
          </div>
          {canEdit && <CreateGuaranteeDialog caseId={caseId} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending ? (
          <Skeleton className="h-20 w-full" />
        ) : isError ? (
          <p className="text-sm text-destructive">Impossible de charger les garanties. Veuillez réessayer.</p>
        ) : !guarantees || guarantees.length === 0 ? (
          <Empty className="border border-dashed py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldCheck />
              </EmptyMedia>
              <EmptyTitle>Aucune garantie</EmptyTitle>
              <EmptyDescription>Les garanties détenues ou à recueillir pour ce dossier apparaîtront ici.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          guarantees.map((guarantee) => <GuaranteeCard key={guarantee.id} caseId={caseId} guarantee={guarantee} canEdit={canEdit} />)
        )}
      </CardContent>
    </Card>
  );
}
