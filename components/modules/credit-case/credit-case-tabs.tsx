"use client";

import { FileText, LineChart, ScrollText } from "lucide-react";
import {
  AmortizationOverview,
  AmortizationPanel,
  useAmortizationOverview,
} from "@/components/modules/amortization-schedule";
import { CreditCaseDetail } from "./credit-case-detail";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * The dossier is the parent screen; its content is split into focused tabs so
 * the user opens one concise section at a time instead of scrolling through
 * everything: the dossier's own details, the amortization overview, and the
 * échéancier / traités workflow. The overview query is shared with the tab
 * content through the cache — checking its presence costs no extra request.
 */
export function CreditCaseTabs({ caseId }: Readonly<{ caseId: string }>) {
  const overview = useAmortizationOverview(caseId, {});

  return (
    <Tabs defaultValue="details">
      <TabsList>
        <TabsTrigger value="details">
          <FileText />
          Détails
        </TabsTrigger>
        <TabsTrigger value="amortissement">
          <LineChart />
          Amortissement
        </TabsTrigger>
        <TabsTrigger value="traites">
          <ScrollText />
          Échéancier &amp; traités
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="pt-4">
        <CreditCaseDetail caseId={caseId} />
      </TabsContent>

      <TabsContent value="amortissement" className="pt-4">
        {overview.data === null ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LineChart />
              </EmptyMedia>
              <EmptyTitle>Aucun échéancier importé</EmptyTitle>
              <EmptyDescription>
                Importez l&apos;échéancier depuis l&apos;onglet « Échéancier &amp; traités » pour voir la progression du
                financement.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <AmortizationOverview caseId={caseId} />
        )}
      </TabsContent>

      <TabsContent value="traites" className="pt-4">
        <AmortizationPanel caseId={caseId} />
      </TabsContent>
    </Tabs>
  );
}
