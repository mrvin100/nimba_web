import { CreateCaseDialog } from "./create-case-dialog";
import { CreditCaseList } from "./credit-case-list";

/** Dashboard feature: header + create action + the credit-case list. */
export function CreditCaseDashboard() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dossiers de crédit</h1>
          <p className="text-sm text-muted-foreground">Vos dossiers de crédit-bail</p>
        </div>
        <CreateCaseDialog />
      </div>
      <CreditCaseList />
    </div>
  );
}
