"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTrades } from "./useAmortizationSchedule";
import { ScheduleImport } from "./schedule-import";
import { TradesTable } from "./trades-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Drives the amortization area of a dossier from the trades it has: with trades it
 * shows them (and export, plus an optional re-import to supersede); without, it
 * shows the import → generate workflow.
 */
export function AmortizationPanel({ caseId }: { caseId: string }) {
  const { data: trades, isPending, isError } = useTrades(caseId);
  const [reimport, setReimport] = useState(false);
  const hasTrades = !!trades && trades.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-base">Tableau d'amortissement</CardTitle>
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
            <TradesTable caseId={caseId} trades={trades} />
            {reimport && (
              <div className="border-t pt-6">
                <ScheduleImport caseId={caseId} />
              </div>
            )}
          </>
        ) : (
          <ScheduleImport caseId={caseId} />
        )}
      </CardContent>
    </Card>
  );
}
