import { Badge } from "@/components/ui/badge";
import type { CreditCaseStatus } from "./credit-case-schemas";

const LABELS: Record<CreditCaseStatus, { label: string; variant: "secondary" | "default" }> = {
  EN_ATTENTE_AMORTISSEMENT: { label: "En attente d'amortissement", variant: "secondary" },
  TRADES_GENERES: { label: "Trades générés", variant: "default" },
};

export function CreditCaseStatusBadge({ status }: { status: CreditCaseStatus }) {
  const { label, variant } = LABELS[status];
  return <Badge variant={variant}>{label}</Badge>;
}
