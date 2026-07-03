"use client";

import { useState } from "react";
import { CheckCircle2, ChevronsUpDown, RefreshCw, TriangleAlert } from "lucide-react";
import { formatDate } from "@/lib/format";
import { useGenerateTrades, useLatestSchedule, useTrades } from "./useAmortizationSchedule";
import { ScheduleImport } from "./schedule-import";
import { TradesTable } from "./trades-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Drives the échéancier / traités area of a dossier from SERVER state (the
 * schedule-state query + the trades list), never from what happened earlier in
 * the session — a page refresh lands on exactly the same view. Three states:
 * nothing imported (the import workflow), imported but trades not generated
 * (generate / re-import), trades generated (collapsible list, with a regenerate
 * warning when a re-import superseded the generated trades' source version).
 */
export function AmortizationPanel({ caseId }: Readonly<{ caseId: string }>) {
  const { data: trades, isPending: tradesPending, isError } = useTrades(caseId);
  const { data: schedule, isPending: schedulePending } = useLatestSchedule(caseId);
  const generateTrades = useGenerateTrades(caseId);
  const [reimport, setReimport] = useState(false);
  const [tradesOpen, setTradesOpen] = useState(false);

  const isPending = tradesPending || schedulePending;
  const hasTrades = !!trades && trades.length > 0;
  const hasSchedule = !!schedule;

  const description = hasTrades
    ? "Trades générés à partir de l'échéancier importé."
    : hasSchedule
      ? "Échéancier importé — générez les trades ou réimportez un fichier corrigé."
      : "Importez l'échéancier d'amortissement puis générez les trades.";

  const generateButton = (
    <Button onClick={() => generateTrades.mutate()} disabled={generateTrades.isPending}>
      {generateTrades.isPending ? "Génération…" : hasTrades ? "Régénérer les trades" : "Générer les trades"}
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-base">Échéancier &amp; traités</CardTitle>
            <CardDescription>{isPending ? "Chargement…" : description}</CardDescription>
          </div>
          {hasSchedule && (
            <Button variant="outline" size="sm" onClick={() => setReimport((value) => !value)}>
              <RefreshCw />
              {reimport ? "Annuler" : "Réimporter"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isPending ? (
          <Skeleton className="h-40 w-full" />
        ) : isError ? (
          <p className="text-sm text-destructive">Impossible de charger les trades. Veuillez réessayer.</p>
        ) : hasTrades ? (
          <>
            {schedule && !schedule.tradesUpToDate && (
              <Alert>
                <TriangleAlert />
                <AlertTitle>Échéancier réimporté (version {schedule.versionNumber})</AlertTitle>
                <AlertDescription className="space-y-3">
                  <p>
                    Les traités affichés proviennent d&apos;une version précédente de l&apos;échéancier. Régénérez-les
                    pour qu&apos;ils reflètent la version {schedule.versionNumber} ({schedule.lineCount} lignes).
                  </p>
                  {generateButton}
                </AlertDescription>
              </Alert>
            )}
            {/* The generated trades are secondary detail: shown on demand only. */}
            <Collapsible open={tradesOpen} onOpenChange={setTradesOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent">
                  <span className="font-medium">Voir les traités générés ({trades.length})</span>
                  <ChevronsUpDown className="size-4 text-muted-foreground" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <TradesTable caseId={caseId} trades={trades} />
              </CollapsibleContent>
            </Collapsible>
            {reimport && (
              <>
                <Separator />
                <ScheduleImport caseId={caseId} onUploaded={() => setReimport(false)} />
              </>
            )}
          </>
        ) : hasSchedule ? (
          <>
            <Alert>
              <CheckCircle2 />
              <AlertTitle>Échéancier importé, trades à générer</AlertTitle>
              <AlertDescription>
                Version {schedule.versionNumber} · {schedule.lineCount} lignes · {schedule.originalFilename} · importé le{" "}
                {formatDate(schedule.uploadedAt)} · échéance ordinaire +{schedule.ordinaryOffsetMonths} mois, VR +
                {schedule.vrOffsetMonths} mois, jour {schedule.fixedDayOfMonth}.
              </AlertDescription>
            </Alert>
            {generateButton}
            {reimport && (
              <>
                <Separator />
                <ScheduleImport caseId={caseId} onUploaded={() => setReimport(false)} />
              </>
            )}
          </>
        ) : (
          <ScheduleImport caseId={caseId} />
        )}
      </CardContent>
    </Card>
  );
}
