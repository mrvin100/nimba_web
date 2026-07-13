"use client";

import { usePv } from "@/components/modules/pv";
import { FmpGenerateForm } from "./fmp-generate-form";
import { FmpView } from "./fmp-view";
import { useFmp } from "./useFmp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * The dossier's FMP: not generatable until the PV is finalized (design
 * §10.4), then a one-step DCM extract with no further editing. DCM-only
 * mutation — the backend enforces this, this panel only hides the generation
 * form from a viewer who couldn't use it anyway.
 */
export function FmpPanel({ caseId }: Readonly<{ caseId: string }>) {
  const { data: pv, isPending: pvPending } = usePv(caseId);
  const { data: fmp, isPending: fmpPending } = useFmp(caseId);

  const isPending = pvPending || fmpPending;
  if (isPending) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Not yet reachable: the PV isn't finalized and no FMP exists.
  if (!fmp && pv?.status !== "FINAL") return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fiche de Mise en Place</CardTitle>
        <CardDescription>{!fmp ? "Le PV est finalisé — la FMP peut être générée." : "Extraite du PV finalisé."}</CardDescription>
      </CardHeader>
      <CardContent>{!fmp ? <FmpGenerateForm caseId={caseId} /> : <FmpView fmp={fmp} />}</CardContent>
    </Card>
  );
}
