import { WorkflowQueueView } from "@/components/modules/workflow";
import { ROUTES } from "@/lib/constants";

export default function DrcPage() {
  return <WorkflowQueueView workspaceBase={ROUTES.DRC} />;
}
