"use client";

import { useMemo } from "react";
import { FileCheck2 } from "lucide-react";
import { formatAmount, formatDate } from "@/lib/format";
import { useLatestSchedule } from "@/components/modules/amortization-schedule";
import { useAnalysisSheet, useCreateAnalysisSheet, useFaSections, usePublishAnalysisSheet } from "./useAnalysisSheet";
import { AnalysisSheetStatusBadge } from "./analysis-sheet-status-badge";
import { FaSectionBody } from "./fa-section-body";
import type { FaPilier, FaSection } from "./schema";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PILIER_LABELS: Record<FaPilier, string> = {
  COVER: "Couverture",
  PILIER_1: "Pilier 1 — Entreprise",
  PILIER_3: "Pilier 3 — Analyse financière",
  PILIER_4: "Pilier 4 — Risques & sûretés",
  CONCLUSION: "Conclusion",
};

/** Groups sections by pilier, preserving the registry's order (both the piliers and their sections within). */
function groupByPilier(sections: FaSection[]): Map<FaPilier, FaSection[]> {
  const grouped = new Map<FaPilier, FaSection[]>();
  for (const section of sections) {
    const list = grouped.get(section.pilier) ?? [];
    list.push(section);
    grouped.set(section.pilier, list);
  }
  return grouped;
}

/**
 * Constitution status of a dossier's Fiche d'analyse, driven entirely from
 * server state (like the amortization panel): not startable until the TA
 * exists, then initiate → fill in each section → publish (which locks every
 * section). Sections are grouped into one tab per pilier, each rendered as an
 * accordion — see [FaSectionBody] for how each section type is displayed.
 */
export function AnalysisSheetPanel({ caseId }: Readonly<{ caseId: string }>) {
  const { data: schedule, isPending: schedulePending } = useLatestSchedule(caseId);
  const { data: sheet, isPending: sheetPending } = useAnalysisSheet(caseId);
  const createSheet = useCreateAnalysisSheet(caseId);
  const publishSheet = usePublishAnalysisSheet(caseId);
  const { data: sections, isPending: sectionsPending } = useFaSections(caseId, Boolean(sheet));

  const isPending = schedulePending || sheetPending;
  const grouped = useMemo(() => groupByPilier(sections ?? []), [sections]);
  const piliers = [...grouped.keys()];
  const locked = sheet?.status === "PUBLISHED";

  const description = isPending
    ? "Chargement…"
    : sheet
      ? sheet.status === "PUBLISHED"
        ? "Publiée — le dossier est prêt pour la revue DCM."
        : "Brouillon en cours de rédaction."
      : schedule
        ? "Prête à être initiée depuis l'échéancier importé."
        : "Importez d'abord l'échéancier.";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-base">Fiche d&apos;analyse</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {sheet && <AnalysisSheetStatusBadge status={sheet.status} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : !schedule ? (
          <Alert>
            <AlertTitle>Aucun échéancier importé</AlertTitle>
            <AlertDescription>
              La fiche d&apos;analyse reprend les chiffres du tableau d&apos;amortissement — importez-le d&apos;abord
              depuis l&apos;onglet Amortissement.
            </AlertDescription>
          </Alert>
        ) : !sheet ? (
          <Button onClick={() => createSheet.mutate()} disabled={createSheet.isPending}>
            <FileCheck2 />
            {createSheet.isPending ? "Initiation…" : "Initier la fiche d'analyse"}
          </Button>
        ) : (
          <>
            {sheet.taSummary && (
              <p className="text-sm text-muted-foreground">
                Montant financé {formatAmount(sheet.taSummary.loanAmount)} · {sheet.taSummary.durationMonths} échéances
                · {formatDate(sheet.taSummary.startDate)} → {formatDate(sheet.taSummary.endDate)}
              </p>
            )}

            {sectionsPending ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <Tabs defaultValue={piliers[0]}>
                <TabsList>
                  {piliers.map((pilier) => (
                    <TabsTrigger key={pilier} value={pilier}>
                      {PILIER_LABELS[pilier]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {[...grouped.entries()].map(([pilier, list]) => (
                  <TabsContent key={pilier} value={pilier} className="pt-4">
                    <Accordion type="multiple">
                      {list.map((section) => (
                        <AccordionItem key={section.key} value={section.key}>
                          <AccordionTrigger>{section.label}</AccordionTrigger>
                          <AccordionContent>
                            <FaSectionBody caseId={caseId} section={section} locked={locked} taSummary={sheet.taSummary} />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                ))}
              </Tabs>
            )}

            {!locked && (
              <div className="flex justify-end">
                <Button type="button" onClick={() => publishSheet.mutate()} disabled={publishSheet.isPending}>
                  {publishSheet.isPending ? "Publication…" : "Publier"}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
