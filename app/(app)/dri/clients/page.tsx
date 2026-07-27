import { ClientsRegistryView } from "@/components/modules/client-file";
import { ROUTES } from "@/lib/constants";

export default function DriClientsPage() {
  return <ClientsRegistryView workspaceBase={ROUTES.DRI} />;
}
