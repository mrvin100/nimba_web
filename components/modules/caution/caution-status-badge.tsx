import { Badge } from "@/components/ui/badge";
import { CAUTION_STATUS_LABELS, type CautionStatus } from "./schema";

const VARIANTS: Record<CautionStatus, "secondary" | "default"> = {
  DRAFT: "secondary",
  FINAL: "default",
};

export function CautionStatusBadge({ status }: Readonly<{ status: CautionStatus }>) {
  return <Badge variant={VARIANTS[status]}>{CAUTION_STATUS_LABELS[status]}</Badge>;
}
