"use client";

import Link from "next/link";
import { useSession } from "@/components/modules/identity";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useCreditCase } from "./useCreditCase";
import { CreditCaseStatusBadge } from "./credit-case-status-badge";
import { EditCaseDialog } from "./edit-case-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-2 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

/** [backHref] and the edit action are DRI-specific; reviewers see the same card read-only. */
export function CreditCaseDetail({ caseId, backHref = ROUTES.DRI }: Readonly<{ caseId: string; backHref?: string }>) {
  const { data, isPending, isError } = useCreditCase(caseId);
  const session = useSession();

  if (isPending) {
    // Mirror the loaded card's structure (header + four rows) so nothing shifts or
    // reflows when the data arrives — same chrome, same paddings, same row spacing.
    return (
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-4 border-b py-2 last:border-b-0">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-muted-foreground">
        Dossier introuvable.{" "}
        <Link href={backHref} className="underline underline-offset-4">
          Retour au tableau de bord
        </Link>
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle>{data.caseNumber}</CardTitle>
            <CardDescription>{data.clientName}</CardDescription>
          </div>
          {session.hasDepartment("DRI") && <EditCaseDialog creditCase={data} />}
        </div>
      </CardHeader>
      <CardContent>
        <DetailRow label="Type de produit">{data.productType}</DetailRow>
        {data.contractType && <DetailRow label="Type de contrat">{data.contractType}</DetailRow>}
        <DetailRow label="Devise">{data.currency}</DetailRow>
        <DetailRow label="N° de compte">{data.accountNumber ?? "—"}</DetailRow>
        <DetailRow label="Statut">
          <CreditCaseStatusBadge status={data.status} />
        </DetailRow>
        <DetailRow label="Créé le">{formatDate(data.createdAt, "long")}</DetailRow>
      </CardContent>
    </Card>
  );
}
