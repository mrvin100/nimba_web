"use client";

import Link from "next/link";
import { useClientDossiers, DOSSIER_STATUS_LABELS } from "@/components/modules/caution";
import { useClient } from "@/components/modules/client";
import { useClientCreditCases } from "@/components/modules/credit-case";
import { caseDetailPath, ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/** One label/value row of the client's identity. */
function Row({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

/**
 * A client's 360 view: their identity plus every product they hold — credit
 * dossiers (financement) and caution dossiers (engagement par signature) — the
 * concrete payoff of the unified Client. [workspaceBase] scopes the credit-dossier
 * links to the current workspace; caution links only render in the DCM workspace,
 * which is the only one that may open them.
 */
export function ClientFileView({ clientId, workspaceBase }: Readonly<{ clientId: string; workspaceBase: string }>) {
  const { data: client, isPending } = useClient(clientId);
  const cases = useClientCreditCases(clientId);
  const cautions = useClientDossiers(clientId);
  const canOpenCautions = workspaceBase === ROUTES.DCM;

  if (isPending) return <Skeleton className="h-64 w-full" />;
  if (!client) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{client.raisonSociale}</CardTitle>
          <CardDescription>{client.matricule ? `Matricule ${client.matricule}` : "Matricule non renseigné"}</CardDescription>
        </CardHeader>
        <CardContent>
          <Row label="Forme juridique">{client.formeJuridique ?? "—"}</Row>
          <Row label="Sigle">{client.sigle ?? "—"}</Row>
          <Row label="Code NIF">{client.codeNif ?? "—"}</Row>
          <Row label="RCCM">{client.rccm ?? "—"}</Row>
          <Row label="Principal dirigeant">{client.principalDirigeant ?? "—"}</Row>
          <Row label="Adresse physique">{client.adressePhysique ?? "—"}</Row>
          <Row label="Agence">{client.agence ?? "—"}</Row>
          <Row label="Gestionnaire">{client.gestionnaire ?? "—"}</Row>
          <Row label="N° de compte">{client.accountNumber ?? "—"}</Row>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dossiers de crédit</CardTitle>
          <CardDescription>Leasing et MC2/MUFFA de ce client.</CardDescription>
        </CardHeader>
        <CardContent>
          {cases.isPending ? (
            <Skeleton className="h-20 w-full" />
          ) : (cases.data?.content.length ?? 0) === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Aucun dossier de crédit.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° dossier</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.data?.content.map((dossier) => (
                  <TableRow key={dossier.id}>
                    <TableCell>
                      <Link className="font-medium underline-offset-4 hover:underline" href={caseDetailPath(dossier.id, workspaceBase)}>
                        {dossier.caseNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{dossier.productType}</TableCell>
                    <TableCell>{dossier.status}</TableCell>
                    <TableCell>{formatDate(dossier.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dossiers de caution</CardTitle>
          <CardDescription>Engagements par signature (SMS, ACF…).</CardDescription>
        </CardHeader>
        <CardContent>
          {cautions.isPending ? (
            <Skeleton className="h-20 w-full" />
          ) : (cautions.data?.content.length ?? 0) === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Aucun dossier de caution.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cautions.data?.content.map((dossier) => (
                  <TableRow key={dossier.id}>
                    <TableCell className="font-medium">
                      {canOpenCautions ? (
                        <Link className="underline-offset-4 hover:underline" href={`${ROUTES.DCM}/caution-dossiers/${dossier.id}`}>
                          {dossier.referenceNumber}
                        </Link>
                      ) : (
                        dossier.referenceNumber
                      )}
                    </TableCell>
                    <TableCell>{DOSSIER_STATUS_LABELS[dossier.status]}</TableCell>
                    <TableCell>{formatDate(dossier.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
