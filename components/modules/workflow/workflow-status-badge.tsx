import { Badge } from "@/components/ui/badge";
import { WORKFLOW_STATUS_LABELS, type WorkflowStatus } from "./schema";

const VARIANTS: Record<WorkflowStatus, "default" | "secondary" | "destructive" | "outline"> = {
  BROUILLON: "secondary",
  EN_REVUE_DCM: "outline",
  EN_REVUE_DRC: "outline",
  CORRECTIONS_DRI: "secondary",
  A_COMPLETER: "secondary",
  EN_VERIFICATION_DCM: "outline",
  PRET_POUR_COMITE: "outline",
  APPROUVE: "default",
  EN_ARCHIVAGE: "destructive",
  REJETE: "destructive",
  EN_SIGNATURE: "outline",
  SIGNE: "default",
  EN_COURS: "default",
  CLOTURE: "secondary",
};

export function WorkflowStatusBadge({ status }: { status: WorkflowStatus }) {
  return <Badge variant={VARIANTS[status]}>{WORKFLOW_STATUS_LABELS[status]}</Badge>;
}
