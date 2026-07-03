import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreditCaseDetail } from "@/components/modules/credit-case";
import { AmortizationOverview, AmortizationPanel } from "@/components/modules/amortization-schedule";
import { ROUTES } from "@/lib/constants";

export default async function CreditCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href={ROUTES.DRI}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        <ArrowLeft className="size-4" />
        Tous les dossiers
      </Link>
      <div className="space-y-6">
        <CreditCaseDetail caseId={id} />
        <AmortizationOverview caseId={id} />
        <AmortizationPanel caseId={id} />
      </div>
    </main>
  );
}
