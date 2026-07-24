import { AllCasesView } from "@/components/modules/credit-case";
import { ROUTES } from "@/lib/constants";

export default function DcmAllCasesPage() {
  return <AllCasesView workspaceBase={ROUTES.DCM} />;
}
