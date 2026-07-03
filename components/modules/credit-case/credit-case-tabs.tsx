"use client";

import { FileText, LineChart, ScrollText } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AmortizationOverview,
  AmortizationPanel,
  useAmortizationOverview,
} from "@/components/modules/amortization-schedule";
import { CreditCaseDetail } from "./credit-case-detail";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = ["apercu", "amortissement"] as const;
type TabValue = (typeof TABS)[number];

/**
 * The dossier screen: two parent tabs driven by the `?tab=` search param so the
 * sidebar's contextual sub-navigation deep-links into them — "Aperçu" is the
 * dossier itself, "Amortissement" keeps its own two sub-tabs (server-computed
 * overview, and the échéancier / traités workflow). The overview query is shared
 * with the tab content through the cache — presence costs no extra request.
 */
export function CreditCaseTabs({ caseId }: Readonly<{ caseId: string }>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const overview = useAmortizationOverview(caseId, {});

  const requested = searchParams.get("tab");
  const tab: TabValue = TABS.includes(requested as TabValue) ? (requested as TabValue) : "apercu";

  function onTabChange(value: string) {
    router.replace(`${pathname}?tab=${value}`, { scroll: false });
  }

  return (
    <Tabs value={tab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="apercu">
          <FileText />
          Aperçu du dossier
        </TabsTrigger>
        <TabsTrigger value="amortissement">
          <LineChart />
          Amortissement
        </TabsTrigger>
      </TabsList>

      <TabsContent value="apercu" className="pt-4">
        <CreditCaseDetail caseId={caseId} />
      </TabsContent>

      <TabsContent value="amortissement" className="pt-4">
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
                    Importez l&apos;échéancier depuis le sous-onglet « Échéancier &amp; traités » pour voir la
                    progression du financement.
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
      </TabsContent>
    </Tabs>
  );
}
