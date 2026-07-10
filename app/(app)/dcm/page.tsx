import { WorkflowQueueView } from "@/components/modules/workflow";
import { ROUTES } from "@/lib/constants";

export default function DcmPage() {
  return <WorkflowQueueView workspaceBase={ROUTES.DCM} />;
}
