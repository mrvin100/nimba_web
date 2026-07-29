import { ReviewerCaseListView } from "@/components/modules/credit-case";
import { ROUTES } from "@/lib/constants";

export default function ComitePage() {
  return <ReviewerCaseListView workspaceBase={ROUTES.COMITE} />;
}
