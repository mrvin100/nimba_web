import { CautionDossierDetailView } from "@/components/modules/caution";

export default async function DcmCautionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CautionDossierDetailView dossierId={id} />;
}
