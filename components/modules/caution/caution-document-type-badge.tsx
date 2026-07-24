import { Badge } from "@/components/ui/badge";
import type { CautionDocumentType } from "./schema";

/**
 * The code alone (SMS, ACF...), not the full label — DCM staff already read
 * these as acronyms (it's literally what's printed in the reference number),
 * and the full label is one hover/detail view away, not needed to scan a list.
 */
export function CautionDocumentTypeBadge({ documentType }: Readonly<{ documentType: CautionDocumentType }>) {
  return <Badge variant="outline">{documentType}</Badge>;
}
