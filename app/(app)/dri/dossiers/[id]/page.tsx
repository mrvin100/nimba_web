import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreditCaseTabs } from "@/components/modules/credit-case";
import { ROUTES } from "@/lib/constants";

export default async function CreditCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href={ROUTES.DRI}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        <ArrowLeft className="size-4" />
        Tous les dossiers
      </Link>
      <CreditCaseTabs caseId={id} />
    </main>
  );
}
