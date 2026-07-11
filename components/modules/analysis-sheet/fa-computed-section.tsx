"use client";

import Link from "next/link";
// Direct file import, not the credit-case barrel — see fa-bound-section.tsx's note.
import { useCreditCase } from "@/components/modules/credit-case/useCreditCase";
import { formatAmount } from "@/lib/format";
import type { FaSectionKey, ScheduleSummary } from "./schema";

/**
 * Read-only figures derived from the TA and the conditions de banque — never
 * editable, never persisted (see [FaSectionType]). §3.5 is literally the
 * imported échéancier, so it links to the tab that already renders it rather
 * than duplicating the table here.
 */
export function FaComputedSection({
  caseId,
  sectionKey,
  taSummary,
}: Readonly<{ caseId: string; sectionKey: FaSectionKey; taSummary: ScheduleSummary | null }>) {
  const { data: creditCase } = useCreditCase(caseId);

  if (sectionKey === "PILIER3_SIMULATION_FINANCEMENT") {
    return (
      <div className="space-y-2 text-sm">
        <p className="text-muted-foreground">
          Cette section correspond exactement à l&apos;échéancier importé — aucune saisie séparée.
        </p>
        <Link href="?tab=amortissement" className="underline underline-offset-4">
          Voir l&apos;échéancier
        </Link>
      </div>
    );
  }

  // PILIER3_RENTABILITE_BANQUE
  const conditions = creditCase?.conditionsDeBanque;
  return (
    <div className="space-y-1 text-sm">
      <p>Taux d&apos;intérêt : {conditions?.tauxInteretPct ?? "—"} %</p>
      <p>Besoin de financement : {formatAmount(taSummary?.loanAmount)}</p>
      <p>Intérêts sur la durée : {formatAmount(taSummary?.totalInteret)}</p>
      <p>Frais d&apos;études : {conditions?.fraisEtudesPct ?? "—"} %</p>
      <p>Valeur résiduelle : {formatAmount(taSummary?.valeurResiduelle)}</p>
    </div>
  );
}
