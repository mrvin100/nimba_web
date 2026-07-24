import { ClientFileView } from "@/components/modules/client-file";
import { ROUTES } from "@/lib/constants";

export default async function DriClientFilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientFileView clientId={id} workspaceBase={ROUTES.DRI} />;
}
