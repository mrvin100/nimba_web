"use client";

import { LineChart, ScrollText } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  AmortizationOverview,
  AmortizationPanel,
  useAmortizationOverview,
} from "@/components/modules/amortization-schedule";
import { AnalysisSheetPanel } from "@/components/modules/analysis-sheet";
import { GuaranteePanel } from "@/components/modules/guarantee";
import { WorkflowReviewPanel } from "@/components/modules/workflow";
import { ClientIdentityCard } from "./client-identity-card";
import { CreditCaseDetail } from "./credit-case-detail";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * The dossier screen's sections, selected by the `?tab=` search param — the
 * sidebar's contextual sub-navigation (Aperçu du dossier / Amortissement) is the
 * only switcher, so no duplicate tab row is rendered here. The amortization
 * section keeps its own two sub-tabs (server-computed overview, and the
 * échéancier / traités workflow). The overview query is shared with the content
 * through the cache — presence costs no extra request. Reused as-is by every
 * direction's dossier page ([backHref] points back to the viewer's own
 * workspace); the workflow panel decides for itself whether the viewer can act.
 */
export function CreditCaseTabs({ caseId, backHref }: Readonly<{ caseId: string; backHref?: string }>) {
  const searchParams = useSearchParams();
  const overview = useAmortizationOverview(caseId, {});

  if (searchParams.get("tab") !== "amortissement") {
    return (
      <div className="space-y-6">
        <CreditCaseDetail caseId={caseId} backHref={backHref} />
        <ClientIdentityCard caseId={caseId} />
        <WorkflowReviewPanel caseId={caseId} />
        <AnalysisSheetPanel caseId={caseId} />
        <GuaranteePanel caseId={caseId} />
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">
          <LineChart />
          Vue d&apos;ensemble
        </TabsTrigger>
        <TabsTrigger value="echeancier">
          <ScrollText />
          Échéancier &amp; traités
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="pt-4">
        {overview.data === null ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LineChart />
              </EmptyMedia>
              <EmptyTitle>Aucun échéancier importé</EmptyTitle>
              <EmptyDescription>
                Importez l&apos;échéancier depuis le sous-onglet « Échéancier &amp; traités » pour voir la progression
                du financement.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <AmortizationOverview caseId={caseId} />
        )}
      </TabsContent>

      <TabsContent value="echeancier" className="pt-4">
        <AmortizationPanel caseId={caseId} />
      </TabsContent>
    </Tabs>
  );
}
