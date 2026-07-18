"use client";

import { useMemo } from "react";
import { FileCheck2, FileText, MessageSquare } from "lucide-react";
import { formatAmount, formatDate, formatDateTime } from "@/lib/format";
import { useLatestSchedule } from "@/components/modules/amortization-schedule";
import { DEPARTMENT_LABELS, useSession } from "@/components/modules/identity";
// Direct file imports (not the review barrel) — review's components import this
// module's barrel for FaSectionKey types; going through review/index.ts here
// would close an import cycle between the two barrels.
import { FaSectionComments } from "@/components/modules/review/fa-section-comments";
import { ReviewSubmitBar } from "@/components/modules/review/review-submit-bar";
import { useReviewOverview } from "@/components/modules/review/useReview";
import { REVIEW_VERDICT_LABELS } from "@/components/modules/review/schema";
import { useWorkflowState } from "@/components/modules/workflow";
import { useAnalysisSheet, useCreateAnalysisSheet, useFaSections, usePublishAnalysisSheet, useUnpublishAnalysisSheet } from "./useAnalysisSheet";
import { analysisSheetDocxExportPath } from "./analysis-sheet.service";
import { AnalysisSheetStatusBadge } from "./analysis-sheet-status-badge";
import { FaSectionBody } from "./fa-section-body";
import type { FaPilier, FaSection } from "./schema";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PILIER_LABELS: Record<FaPilier, string> = {
  COVER: "Couverture",
  PILIER_1: "Pilier 1 ~ Entreprise",
  PILIER_2: "Pilier 2 ~ Marché / contrat",
  PILIER_3: "Pilier 3 ~ Analyse financière",
  PILIER_4: "Pilier 4 ~ Risques & sûretés",
  CONCLUSION: "Conclusion",
  ANNEXES: "Annexes",
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
  const session = useSession();
  const { data: schedule, isPending: schedulePending } = useLatestSchedule(caseId);
  const { data: sheet, isPending: sheetPending } = useAnalysisSheet(caseId);
  const { data: workflowState } = useWorkflowState(caseId);
  const { data: review } = useReviewOverview(caseId);
  const createSheet = useCreateAnalysisSheet(caseId);
  const publishSheet = usePublishAnalysisSheet(caseId);
  const unpublishSheet = useUnpublishAnalysisSheet(caseId);
  const { data: sections, isPending: sectionsPending } = useFaSections(caseId, Boolean(sheet));

  const isPending = schedulePending || sheetPending;
  const grouped = useMemo(() => groupByPilier(sections ?? []), [sections]);
  const piliers = [...grouped.keys()];
  const locked = sheet?.status === "PUBLISHED";

  // The GitHub-style review layer: the active reviewer gets the submit bar,
  // members of the reviewing directions can open threads on any section, and
  // the DRI can still unpublish while the dossier was never submitted.
  const status = workflowState?.status;
  const reviewingAs = status === "EN_REVUE_DCM" && session.hasDepartment("DCM") ? "DCM" : status === "EN_REVUE_DRC" && session.hasDepartment("DRC") ? "DRC" : null;
  const canComment = Boolean(sheet) && (["DRI", "DCM", "DRC"] as const).some((dept) => session.hasDepartment(dept));
  const canUnpublish = locked && status === "BROUILLON" && session.hasDepartment("DRI") && (workflowState?.timeline.length ?? 0) === 0;
  const threadsBySection = useMemo(() => {
    const map = new Map<string, NonNullable<typeof review>["threads"]>();
    for (const thread of review?.threads ?? []) {
      map.set(thread.sectionKey, [...(map.get(thread.sectionKey) ?? []), thread]);
    }
    return map;
  }, [review]);

  const description = isPending
    ? "Chargement…"
    : sheet
      ? sheet.status === "PUBLISHED"
        ? "Publiée - le dossier est prêt pour la revue DCM."
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
          <div className="flex items-center gap-2">
            {sheet && <AnalysisSheetStatusBadge status={sheet.status} />}
            <Button variant="outline" size="sm" asChild>
              <a href={analysisSheetDocxExportPath(caseId)} download>
                <FileText />
                Exporter (.docx)
              </a>
            </Button>
          </div>
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
            {reviewingAs && (
              <ReviewSubmitBar caseId={caseId} department={reviewingAs} pendingComments={review?.myDraft?.pendingComments ?? 0} />
            )}

            {(review?.reviews.length ?? 0) > 0 && (
              <div className="space-y-1 rounded-md border p-3">
                <p className="text-sm font-medium">Revues soumises</p>
                {review?.reviews.map((item) => (
                  <p key={item.id} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{item.reviewerName}</span> (
                    {DEPARTMENT_LABELS[item.department]}) — {REVIEW_VERDICT_LABELS[item.verdict]} ·{" "}
                    {formatDateTime(item.submittedAt)}
                    {item.summary ? ` — ${item.summary}` : ""}
                  </p>
                ))}
                {(review?.unresolvedCount ?? 0) > 0 && (
                  <p className="text-sm text-amber-600">
                    {review?.unresolvedCount} fil{(review?.unresolvedCount ?? 0) > 1 ? "s" : ""} non résolu
                    {(review?.unresolvedCount ?? 0) > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}

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
                      {list.map((section) => {
                        const sectionThreads = threadsBySection.get(section.key) ?? [];
                        const openThreads = sectionThreads.filter((thread) => thread.resolvedAt === null).length;
                        return (
                          <AccordionItem key={section.key} value={section.key}>
                            <AccordionTrigger>
                              <span className="flex items-center gap-2">
                                {section.label}
                                {sectionThreads.length > 0 && (
                                  <Badge variant={openThreads > 0 ? "default" : "secondary"} className="gap-1">
                                    <MessageSquare className="size-3" />
                                    {sectionThreads.length}
                                  </Badge>
                                )}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <FaSectionBody caseId={caseId} section={section} locked={locked} taSummary={sheet.taSummary} />
                              <FaSectionComments
                                caseId={caseId}
                                sectionKey={section.key}
                                threads={sectionThreads}
                                canComment={canComment}
                              />
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
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
            {canUnpublish && (
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={() => unpublishSheet.mutate()} disabled={unpublishSheet.isPending}>
                  {unpublishSheet.isPending ? "Dépublication…" : "Repasser en brouillon"}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
