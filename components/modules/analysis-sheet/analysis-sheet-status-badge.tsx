import { Badge } from "@/components/ui/badge";
import type { AnalysisSheetStatus } from "./schema";

const LABELS: Record<AnalysisSheetStatus, { label: string; variant: "secondary" | "default" }> = {
  DRAFT: { label: "Brouillon", variant: "secondary" },
  PUBLISHED: { label: "Publiée", variant: "default" },
};

export function AnalysisSheetStatusBadge({ status }: { status: AnalysisSheetStatus }) {
  const { label, variant } = LABELS[status];
  return <Badge variant={variant}>{label}</Badge>;
}
