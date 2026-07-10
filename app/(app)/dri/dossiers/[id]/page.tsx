import { CreditCaseDetailPage } from "@/components/modules/credit-case";
import { ROUTES } from "@/lib/constants";

export default async function DriCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CreditCaseDetailPage caseId={id} backHref={ROUTES.DRI} backLabel="Tous les dossiers" />;
}
