import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreditCaseTabs } from "./credit-case-tabs";

/**
 * The dossier detail screen's shell, shared by every workspace that reviews a
 * dossier (DRI's own page and every reviewer's `/{workspace}/dossiers/[id]`
 * route) — only the "back" destination and its label change.
 */
export function CreditCaseDetailPage({
  caseId,
  backHref,
  backLabel,
}: Readonly<{ caseId: string; backHref: string; backLabel: string }>) {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Link>
      <CreditCaseTabs caseId={caseId} backHref={backHref} />
    </main>
  );
}
