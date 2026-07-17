"use client";

// Direct file imports (not the module barrels): both credit-case/index.ts and
// this module's own index.ts re-export CreditCaseTabs/AnalysisSheetPanel, which
// import each other — going through either barrel here would create a cycle.
import { ClientIdentityCard } from "@/components/modules/credit-case/client-identity-card";
import { ConditionsDeBanqueCard } from "@/components/modules/credit-case/conditions-de-banque-card";
import { GuaranteePanel } from "@/components/modules/guarantee";
import { formatAmount } from "@/lib/format";
import type { FaSectionKey, ScheduleSummary } from "./schema";

function ArticulationSummary({ taSummary }: Readonly<{ taSummary: ScheduleSummary | null }>) {
  if (!taSummary) return <p className="text-sm text-muted-foreground">Aucun échéancier importé.</p>;
  return (
    <div className="space-y-1 text-sm">
      <p>Montant financé : {formatAmount(taSummary.loanAmount)}</p>
      <p>Durée : {taSummary.durationMonths} échéances</p>
      <p>
        Équipement {formatAmount(taSummary.totalEquipement)} · Assurance {formatAmount(taSummary.totalAssurance)} ·
        Tracking {formatAmount(taSummary.totalTracking)} · Immatriculation {formatAmount(taSummary.totalImmatriculation)}
      </p>
    </div>
  );
}

/**
 * A section bound to an existing dossier-level entity — reuses the exact same
 * card already shown elsewhere on the dossier (single source of truth, no
 * duplicated fetch/render logic) rather than re-implementing its display here.
 */
export function FaBoundSection({
  caseId,
  sectionKey,
  taSummary,
}: Readonly<{ caseId: string; sectionKey: FaSectionKey; taSummary: ScheduleSummary | null }>) {
  switch (sectionKey) {
    case "PILIER1_INFOS_GENERALES":
    case "PILIER1_REGULARITE":
      return <ClientIdentityCard caseId={caseId} />;
    case "COVER_CONDITIONS_BANQUE":
    case "CONCLUSION_CONDITIONS_BANQUE":
      return <ConditionsDeBanqueCard caseId={caseId} />;
    case "COVER_GARANTIES":
    case "PILIER4_SURETES":
    case "CONCLUSION_GARANTIES":
      return <GuaranteePanel caseId={caseId} />;
    case "CONCLUSION_ARTICULATION":
      return <ArticulationSummary taSummary={taSummary} />;
    default:
      return null;
  }
}
