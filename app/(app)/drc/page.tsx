import { ReviewerCaseListView } from "@/components/modules/credit-case";
import { ROUTES } from "@/lib/constants";

export default function DrcPage() {
  return <ReviewerCaseListView workspaceBase={ROUTES.DRC} />;
}
