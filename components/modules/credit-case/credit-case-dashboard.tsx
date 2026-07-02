import { PageHeader } from "@/components/shared/page-header";
import { CreateCaseDialog } from "./create-case-dialog";
import { CreditCaseList } from "./credit-case-list";

/** Dashboard feature: header + create action + the credit-case list. */
export function CreditCaseDashboard() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      <PageHeader title="Dossiers de crédit" description="Vos dossiers de crédit-bail">
        <CreateCaseDialog />
      </PageHeader>
      <CreditCaseList />
    </div>
  );
}
