"use client";

import { useSession } from "@/components/modules/identity";
import { isDriEditable, useWorkflowState } from "@/components/modules/workflow";
import { formatAmount } from "@/lib/format";
import { DetailRow } from "./credit-case-detail";
import { EditConditionsDeBanqueDialog } from "./edit-conditions-de-banque-dialog";
import { useCreditCase } from "./useCreditCase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatPercent(value: number | null): string {
  return value === null ? "—" : `${value} %`;
}

/**
 * Bank-set financing terms reused across the FA, the PV and the FMP — captured
 * once here instead of re-entered per document. 1er loyer, loyer mensuel and
 * durée are NOT shown here: they come straight from the TA (see the
 * analysis-sheet panel). Valeur résiduelle here is the bank's contractual
 * percentage, distinct from the TA-derived amount. DRI-only edit while the
 * dossier is still theirs to constitute, like the client-identity card.
 * Shares the `useCreditCase` cache — no extra request.
 */
export function ConditionsDeBanqueCard({ caseId }: Readonly<{ caseId: string }>) {
  const { data, isPending, isError } = useCreditCase(caseId);
  const { data: workflowState } = useWorkflowState(caseId);
  const session = useSession();
  const canEdit = session.hasDepartment("DRI") && isDriEditable(workflowState?.status);

  if (isPending) {
    return (
      <Card>
        <CardContent className="space-y-2 pt-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) return null;
  const conditions = data.conditionsDeBanque;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-base">Conditions de banque</CardTitle>
            <CardDescription>Réutilisées sur la fiche d&apos;analyse, le PV et la fiche de mise en place.</CardDescription>
          </div>
          {canEdit && <EditConditionsDeBanqueDialog caseId={caseId} conditions={conditions} />}
        </div>
      </CardHeader>
      <CardContent>
        <DetailRow label="Taux d'intérêt">{formatPercent(conditions.tauxInteretPct)}</DetailRow>
        <DetailRow label="Frais de mise en place">{formatPercent(conditions.fraisMiseEnPlacePct)}</DetailRow>
        <DetailRow label="Commission d'engagement">{formatPercent(conditions.comEngagementPct)}</DetailRow>
        <DetailRow label="Frais d'études">{formatPercent(conditions.fraisEtudesPct)}</DetailRow>
        <DetailRow label="Frais divers">
          {conditions.fraisDivers.length === 0
            ? "—"
            : conditions.fraisDivers.map((frais) => `${frais.label} (${formatAmount(frais.montant)})`).join(" · ")}
        </DetailRow>
      </CardContent>
    </Card>
  );
}
