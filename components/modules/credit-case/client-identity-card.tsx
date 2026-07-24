"use client";

import { useSession } from "@/components/modules/identity";
import { isDriEditable, useWorkflowState } from "@/components/modules/workflow";
import { formatDate } from "@/lib/format";
import { DetailRow } from "./credit-case-detail";
import { EditClientIdentityDialog } from "./edit-client-identity-dialog";
import { useCreditCase } from "./useCreditCase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Descriptive client detail reused across the FA, the PV and the FMP — captured
 * once here instead of re-entered per document. DRI-only edit, like the case's
 * own "Modifier" action, and only while the dossier is still in the DRI's
 * hands (not yet submitted, or sent back for corrections) — reviewers see the
 * same card read-only, and so does the DRI once it's out for review. Shares
 * the `useCreditCase` cache with `CreditCaseDetail` — no extra request.
 * Renders nothing on error: the detail card above already surfaces "dossier
 * introuvable".
 */
export function ClientIdentityCard({ caseId }: Readonly<{ caseId: string }>) {
  const { data, isPending, isError } = useCreditCase(caseId);
  const { data: workflowState } = useWorkflowState(caseId);
  const session = useSession();
  const canEdit = session.hasDepartment("DRI") && isDriEditable(workflowState?.status);

  if (isPending) {
    return (
      <Card>
        <CardContent className="space-y-2 pt-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) return null;
  const identity = data.clientIdentity;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-base">Identité du client</CardTitle>
            <CardDescription>Réutilisée sur la fiche d&apos;analyse, le PV et la fiche de mise en place.</CardDescription>
          </div>
          {canEdit && <EditClientIdentityDialog caseId={caseId} clientId={data.clientId} identity={identity} />}
        </div>
      </CardHeader>
      <CardContent>
        <DetailRow label="Forme juridique">{identity.formeJuridique ?? "—"}</DetailRow>
        <DetailRow label="Date de création">{formatDate(identity.dateCreation)}</DetailRow>
        <DetailRow label="Adresse physique">{identity.adressePhysique ?? "—"}</DetailRow>
        <DetailRow label="Activité de base">{identity.activiteDeBase ?? "—"}</DetailRow>
        <DetailRow label="Code NIF">{identity.codeNif ?? "—"}</DetailRow>
        <DetailRow label="Principal dirigeant">{identity.principalDirigeant ?? "—"}</DetailRow>
        <DetailRow label="Date d'entrée en relation">{formatDate(identity.dateEntreeRelation)}</DetailRow>
        <DetailRow label="Date de dernière visite">{formatDate(identity.dateDerniereVisite)}</DetailRow>
        <DetailRow label="Agence">{identity.agence ?? "—"}</DetailRow>
        <DetailRow label="Gestionnaire">{identity.gestionnaire ?? "—"}</DetailRow>
        <DetailRow label="Analyste">{identity.analyste ?? "—"}</DetailRow>
        <DetailRow label="Cotation précédente">{identity.cotationPrecedente ?? "—"}</DetailRow>
        <DetailRow label="Cotation actuelle">{identity.cotationActuelle ?? "—"}</DetailRow>
      </CardContent>
    </Card>
  );
}
