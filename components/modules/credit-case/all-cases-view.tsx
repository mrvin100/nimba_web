import { PageHeader } from "@/components/shared/page-header";
import { CreditCaseList } from "./credit-case-list";

/**
 * A reviewer direction's full dossier list, separate from its review queue
 * ("Dossiers à revoir" only ever shows what's currently waiting on this
 * direction; once approved or sent elsewhere a dossier disappears from it
 * with no way back). This is the browsing view: every dossier, so a
 * DCM/DRC/comité member can reopen one they already handled to consult or
 * re-evaluate it. Read-only here, no create action (that stays DRI-only).
 */
export function AllCasesView({ workspaceBase }: Readonly<{ workspaceBase: string }>) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      <PageHeader title="Tous les dossiers" description="Dossiers en cours ou déjà traités, en dehors de votre revue actuelle." />
      <CreditCaseList workspaceBase={workspaceBase} />
    </div>
  );
}
