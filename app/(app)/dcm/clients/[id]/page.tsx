import { ClientFileView } from "@/components/modules/client-file";
import { ROUTES } from "@/lib/constants";

export default async function DcmClientFilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientFileView clientId={id} workspaceBase={ROUTES.DCM} />;
}
