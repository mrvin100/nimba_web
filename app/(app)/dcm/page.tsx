import { ReviewerCaseListView } from "@/components/modules/credit-case";
import { ROUTES } from "@/lib/constants";

export default function DcmPage() {
  return <ReviewerCaseListView workspaceBase={ROUTES.DCM} />;
}
