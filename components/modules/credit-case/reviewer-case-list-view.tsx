import { PageHeader } from "@/components/shared/page-header";
import { CreditCaseList } from "./credit-case-list";

/**
 * A review direction's (DCM, DRC, COMITE) one dossier screen: the review queue
 * and the full dossier list used to be two separate tabs/tables — now one
 * DataTable, defaulting to "En attente de ma revue" with a filter to see the rest.
 */
export function ReviewerCaseListView({ workspaceBase }: Readonly<{ workspaceBase: string }>) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      <PageHeader title="Dossiers" description="Dossiers en attente de votre revue, ou l'ensemble des dossiers via le filtre." />
      <CreditCaseList workspaceBase={workspaceBase} hasReviewQueue />
    </div>
  );
}
