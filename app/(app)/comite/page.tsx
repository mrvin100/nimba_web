import { WorkflowQueueView } from "@/components/modules/workflow";
import { ROUTES } from "@/lib/constants";

export default function ComitePage() {
  return <WorkflowQueueView workspaceBase={ROUTES.COMITE} />;
}
