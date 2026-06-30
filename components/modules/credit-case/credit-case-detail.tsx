"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { useCreditCase } from "./credit-case-hooks";
import { CreditCaseStatusBadge } from "./credit-case-status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-2 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

export function CreditCaseDetail({ caseId }: { caseId: string }) {
  const { data, isPending, isError } = useCreditCase(caseId);

  if (isPending) {
    return <Skeleton className="h-56 w-full" />;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-muted-foreground">
        Dossier introuvable.{" "}
        <Link href={ROUTES.DRI} className="underline underline-offset-4">
          Retour au tableau de bord
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{data.caseNumber}</CardTitle>
          <CardDescription>{data.clientName}</CardDescription>
        </CardHeader>
        <CardContent>
          <DetailRow label="Type de produit">{data.productType}</DetailRow>
          <DetailRow label="Devise">{data.currency}</DetailRow>
          <DetailRow label="Statut">
            <CreditCaseStatusBadge status={data.status} />
          </DetailRow>
          <DetailRow label="Créé le">{dateFormat.format(new Date(data.createdAt))}</DetailRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tableau d'amortissement</CardTitle>
          <CardDescription>
            L'import du tableau d'amortissement et la génération des trades seront disponibles ici.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
