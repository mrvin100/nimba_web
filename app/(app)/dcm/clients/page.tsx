import { ClientsRegistryView } from "@/components/modules/client-file";
import { ROUTES } from "@/lib/constants";

export default function DcmClientsPage() {
  return <ClientsRegistryView workspaceBase={ROUTES.DCM} />;
}
