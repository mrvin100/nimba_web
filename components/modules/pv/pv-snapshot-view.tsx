"use client";

import { GUARANTEE_KIND_LABELS } from "@/components/modules/guarantee";
import { formatAmount, formatDate } from "@/lib/format";
import type { Pv } from "./schema";

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
 * A finalized PV's frozen snapshot — read-only by construction (there is no
 * edit path once [Pv.status] is FINAL). Renders the identité, articulation,
 * garanties and conditions de banque exactly as they stood at finalization,
 * not the dossier's current data.
 */
export function PvSnapshotView({ pv }: Readonly<{ pv: Pv }>) {
  if (!pv.snapshot) return null;
  const { identite, articulation, garanties, conditionsDeBanque } = pv.snapshot;
  const fraisDivers = parseFraisDivers(conditionsDeBanque.fraisDivers);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium">Identité client</p>
        <Row label="Forme juridique">{identite.formeJuridique ?? "—"}</Row>
        <Row label="Principal dirigeant">{identite.principalDirigeant ?? "—"}</Row>
        <Row label="Agence">{identite.agence ?? "—"}</Row>
        <Row label="Gestionnaire">{identite.gestionnaire ?? "—"}</Row>
        <Row label="Cotation actuelle">{identite.cotationActuelle ?? "—"}</Row>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">Articulation du financement</p>
        <Row label="Montant financé">{formatAmount(articulation.loanAmount)}</Row>
        <Row label="Durée">{articulation.durationMonths} échéances</Row>
        <Row label="1er loyer TTC">{formatAmount(articulation.premierLoyerTtc)}</Row>
        <Row label="Loyer mensuel HT">{formatAmount(articulation.loyerMensuelHt)}</Row>
        <Row label="Valeur résiduelle">{formatAmount(articulation.valeurResiduelle)}</Row>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">Garanties</p>
        {garanties.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune garantie.</p>
        ) : (
          garanties.map((garantie, index) => (
            <Row key={index} label={GUARANTEE_KIND_LABELS[garantie.kind]}>
              {garantie.description}
            </Row>
          ))
        )}
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">Conditions de banque</p>
        <Row label="Taux d'intérêt">{conditionsDeBanque.tauxInteretPct ?? "—"} %</Row>
        <Row label="Frais de mise en place">{conditionsDeBanque.fraisMiseEnPlacePct ?? "—"} %</Row>
        <Row label="Commission d'engagement">{conditionsDeBanque.comEngagementPct ?? "—"} %</Row>
        <Row label="Frais d'études">{conditionsDeBanque.fraisEtudesPct ?? "—"} %</Row>
        <Row label="Frais divers">
          {fraisDivers.length === 0 ? "—" : fraisDivers.map((frais) => `${frais.label} (${formatAmount(frais.montant)})`).join(" · ")}
        </Row>
      </div>

      {(pv.pointsForts || pv.pointsFaibles) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-sm font-medium">Points forts</p>
            <p className="whitespace-pre-wrap text-sm">{pv.pointsForts || "—"}</p>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">Points faibles</p>
            <p className="whitespace-pre-wrap text-sm">{pv.pointsFaibles || "—"}</p>
          </div>
        </div>
      )}

      {pv.debats.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium">Débats du comité</p>
          {pv.debats.map((debat, index) => (
            <div key={index} className="space-y-1 border-b py-2 text-sm last:border-b-0">
              <p>
                <span className="text-muted-foreground">Préoccupation : </span>
                {debat.preoccupation}
              </p>
              <p>
                <span className="text-muted-foreground">Réponse : </span>
                {debat.reponse}
              </p>
              <p>
                <span className="text-muted-foreground">Recommandation : </span>
                {debat.recommandation}
              </p>
            </div>
          ))}
        </div>
      )}

      <Row label="Rapporteur">{pv.rapporteur ?? "—"}</Row>
      <Row label="Président">{pv.president ?? "—"}</Row>
      <Row label="Séance du">{formatDate(pv.seanceDate, "long")}</Row>
      <Row label="Finalisé le">{formatDate(pv.finalizedAt, "long")}</Row>
    </div>
  );
}
