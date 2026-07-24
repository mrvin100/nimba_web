import { PageHeader } from "@/components/shared/page-header";
import { CautionList } from "./caution-list";
import { CreateCautionDialog } from "./create-caution-dialog";

/** DCM's Cautions workspace: SMS, ACF, and future document types, all in one list. */
export function CautionsView() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      <PageHeader
        title="Cautions"
        description="Cautions de soumission, attestations de capacité financière et autres documents générés pour vos clients."
      >
        <CreateCautionDialog />
      </PageHeader>
      <CautionList />
    </div>
  );
}
