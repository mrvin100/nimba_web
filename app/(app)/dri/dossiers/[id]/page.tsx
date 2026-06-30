import Link from "next/link";
import { CreditCaseDetail } from "@/components/modules/credit-case";
import { AmortizationPanel } from "@/components/modules/amortization-schedule";
import { ROUTES } from "@/lib/constants";

export default async function CreditCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <Link href={ROUTES.DRI} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
        ← Tous les dossiers
      </Link>
      <CreditCaseDetail caseId={id} />
      <AmortizationPanel caseId={id} />
    </main>
  );
}
