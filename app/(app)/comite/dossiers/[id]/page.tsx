import { CreditCaseDetailPage } from "@/components/modules/credit-case";
import { ROUTES } from "@/lib/constants";

export default async function ComiteCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CreditCaseDetailPage caseId={id} backHref={ROUTES.COMITE} backLabel="File de revue du comité" />;
}
