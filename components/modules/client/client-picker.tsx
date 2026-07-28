"use client";

import { CreateClientDialog } from "./create-client-dialog";
import { useClients } from "./useClient";
import type { Client, ClientSummary } from "./schema";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Client search-or-create picker for the caution creation form. Filters
 * client-side over the first page of clients — fine at the bank's current
 * scale; if the client base grows well past a couple hundred, this should
 * move to a server-side search endpoint instead.
 */
export function ClientPicker({
  value,
  onChange,
}: Readonly<{ value: string | null; onChange: (clientId: string) => void }>) {
  const { data, isPending } = useClients(0, 100);

  const clients = data?.content ?? [];
  const selected = clients.find((client) => client.id === value) ?? null;

  function handleCreated(client: Client) {
    onChange(client.id);
  }

  if (isPending) return <Skeleton className="h-9 w-full" />;

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Combobox
          items={clients}
          value={selected}
          onValueChange={(client) => client && onChange(client.id)}
          itemToStringValue={(client: ClientSummary) => `${client.raisonSociale}${client.matricule ? ` (${client.matricule})` : ""}`}
        >
          <ComboboxInput placeholder="Rechercher par nom ou matricule" className="w-full" />
          <ComboboxContent>
            <ComboboxEmpty>Aucun client trouvé.</ComboboxEmpty>
            <ComboboxList>
              {(client: ClientSummary) => (
                <ComboboxItem key={client.id} value={client}>
                  {client.raisonSociale}
                  {client.matricule ? ` (${client.matricule})` : ""}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <CreateClientDialog onCreated={handleCreated} />
    </div>
  );
}
