"use client";

import { useState } from "react";
import { ChevronsUpDown, RefreshCw } from "lucide-react";
import { useTrades } from "./useAmortizationSchedule";
import { ScheduleImport } from "./schedule-import";
import { TradesTable } from "./trades-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Drives the échéancier / traités area of a dossier: with trades it shows them on
 * demand (collapsible, exports inside) and offers a re-import; without, it shows
 * the import → generate workflow directly.
 */
export function AmortizationPanel({ caseId }: Readonly<{ caseId: string }>) {
  const { data: trades, isPending, isError } = useTrades(caseId);
  const [reimport, setReimport] = useState(false);
  const [tradesOpen, setTradesOpen] = useState(false);
  const hasTrades = !!trades && trades.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-base">Échéancier &amp; traités</CardTitle>
            <CardDescription>
              {hasTrades
                ? "Trades générés à partir de l'échéancier importé."
                : "Importez l'échéancier d'amortissement puis générez les trades."}
            </CardDescription>
          </div>
          {hasTrades && (
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
                <ScheduleImport caseId={caseId} />
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
