"use client";

import { FileText } from "lucide-react";
import { useSession } from "@/components/modules/identity";
import { usePv } from "@/components/modules/pv";
import { FmpGenerateForm } from "./fmp-generate-form";
import { FmpView } from "./fmp-view";
import { fmpDocxExportPath } from "./fmp.service";
import { useFmp } from "./useFmp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * The dossier's FMP: not generatable until the PV is finalized (design
 * §10.4), then a one-step DCM extract with no further editing. DCM-only
 * mutation — the backend enforces this, but the generation form is also
 * hidden from every other direction here so a DRI/DRC/comité viewer never
 * sees an action they'd just get a 403 on.
 */
export function FmpPanel({ caseId }: Readonly<{ caseId: string }>) {
  const session = useSession();
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
  if (!fmp && pv?.status !== "FINAL") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fiche de Mise en Place</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Pas encore disponible</AlertTitle>
            <AlertDescription>La FMP ne peut être générée qu&apos;une fois le PV finalisé par la DCM.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const description = !fmp
    ? session.hasDepartment("DCM")
      ? "Le PV est finalisé, la FMP peut être générée."
      : "Le PV est finalisé, en attente de génération de la FMP par la DCM."
    : "Extraite du PV finalisé.";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-base">Fiche de Mise en Place</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {fmp && (
            <Button variant="outline" size="sm" asChild>
              <a href={fmpDocxExportPath(caseId)} download>
                <FileText />
                Exporter (.docx)
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!fmp && session.hasDepartment("DCM") && <FmpGenerateForm caseId={caseId} />}
        {fmp && <FmpView fmp={fmp} />}
      </CardContent>
    </Card>
  );
}
