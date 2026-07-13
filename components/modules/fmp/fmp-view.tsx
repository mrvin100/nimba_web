"use client";

import { GUARANTEE_KIND_LABELS } from "@/components/modules/guarantee";
import { formatAmount, formatDate } from "@/lib/format";
import type { Fmp } from "./schema";

const VISA_ROLES = ["DRI", "DCM", "DRC", "DJR", "DER", "EXCO"] as const;

function Row({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-2 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

function parseFraisDivers(json: string | null): { label: string; montant: number }[] {
  return json ? (JSON.parse(json) as { label: string; montant: number }[]) : [];
}

/**
 * A generated FMP — pure extract, read-only by construction (no edit path
 * exists once created). DJR/DER/EXCO have no accounts or workflow steps in
 * Nimba (design §10.4 decision): the visa row is print-only, empty signature
 * boxes for every role, not a status derived from any stored data.
 */
export function FmpView({ fmp }: Readonly<{ fmp: Fmp }>) {
  const fraisDivers = parseFraisDivers(fmp.conditionsDeBanque.fraisDivers);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium">En-tête</p>
        <Row label="N° de prêt">{fmp.numeroPret}</Row>
        <Row label="Référence garantie">{fmp.garantieRef ?? "—"}</Row>
        <Row label="Généré le">{formatDate(fmp.createdAt, "long")}</Row>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">Client</p>
        <Row label="Unité / agence">{fmp.identite.agence ?? "—"}</Row>
        <Row label="Client">{fmp.clientName}</Row>
        <Row label="N° de compte">{fmp.accountNumber ?? "—"}</Row>
        <Row label="Cotation">{fmp.identite.cotationActuelle ?? "—"}</Row>
        <Row label="GFC en charge">{fmp.gfcEnCharge}</Row>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">Décision du comité — articulation des financements</p>
        <Row label="Montant financé">{formatAmount(fmp.articulation.loanAmount)}</Row>
        <Row label="Durée">{fmp.articulation.durationMonths} échéances</Row>
        <Row label="1er loyer TTC">{formatAmount(fmp.articulation.premierLoyerTtc)}</Row>
        <Row label="Loyer mensuel HT">{formatAmount(fmp.articulation.loyerMensuelHt)}</Row>
        <Row label="Valeur résiduelle">{formatAmount(fmp.articulation.valeurResiduelle)}</Row>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">Garanties</p>
        {fmp.garanties.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune garantie.</p>
        ) : (
          fmp.garanties.map((garantie, index) => (
            <Row key={index} label={GUARANTEE_KIND_LABELS[garantie.kind]}>
              {garantie.description}
            </Row>
          ))
        )}
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">Conditions de banque</p>
        <Row label="Taux d'intérêt">{fmp.conditionsDeBanque.tauxInteretPct ?? "—"} %</Row>
        <Row label="Frais de mise en place">{fmp.conditionsDeBanque.fraisMiseEnPlacePct ?? "—"} %</Row>
        <Row label="Commission d'engagement">{fmp.conditionsDeBanque.comEngagementPct ?? "—"} %</Row>
        <Row label="Frais d'études">{fmp.conditionsDeBanque.fraisEtudesPct ?? "—"} %</Row>
        <Row label="Frais divers">
          {fraisDivers.length === 0 ? "—" : fraisDivers.map((frais) => `${frais.label} (${formatAmount(frais.montant)})`).join(" · ")}
        </Row>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Visa</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {VISA_ROLES.map((role) => (
            <div key={role} className="flex h-16 flex-col justify-between rounded-md border p-2">
              <span className="text-xs text-muted-foreground">{role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
