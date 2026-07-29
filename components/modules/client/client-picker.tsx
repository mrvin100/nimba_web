"use client";

import Link from "next/link";
import { useClients } from "./useClient";
import type { ClientSummary } from "./schema";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Client search-and-select for a dossier creation form. Filters client-side
 * over the first page of clients — fine at the bank's current scale; if the
 * client base grows well past a couple hundred, this should move to a
 * server-side search endpoint instead. Creation is centralized on the
 * clients registry now (not inline here) — the empty state links there
 * instead of opening its own dialog, so there is exactly one place a client
 * gets created.
 */
export function ClientPicker({
  value,
  onChange,
  workspaceBase,
}: Readonly<{ value: string | null; onChange: (clientId: string) => void; workspaceBase: string }>) {
  const { data, isPending } = useClients(0, 100);

  const clients = data?.content ?? [];
  const selected = clients.find((client) => client.id === value) ?? null;

  if (isPending) return <Skeleton className="h-9 w-full" />;

  function label(client: ClientSummary): string {
    return `${client.raisonSociale}${client.matricule ? ` (${client.matricule})` : ""}`;
  }

  return (
    <Combobox
      items={clients}
      value={selected}
      onValueChange={(client) => client && onChange(client.id)}
      itemToStringLabel={label}
      itemToStringValue={label}
    >
      <ComboboxInput placeholder="Rechercher par nom ou matricule" className="w-full" />
      <ComboboxContent>
        <ComboboxEmpty>
          <div className="space-y-1 py-1 text-center">
            <p>Aucun client trouvé.</p>
            <Link href={`${workspaceBase}/clients`} className="text-xs underline underline-offset-4">
              Créer un client
            </Link>
          </div>
        </ComboboxEmpty>
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
  );
}
