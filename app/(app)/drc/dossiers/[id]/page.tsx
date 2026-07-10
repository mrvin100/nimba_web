import { CreditCaseDetailPage } from "@/components/modules/credit-case";
import { ROUTES } from "@/lib/constants";

export default async function DrcCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CreditCaseDetailPage caseId={id} backHref={ROUTES.DRC} backLabel="File de revue DRC" />;
}
