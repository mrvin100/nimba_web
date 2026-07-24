"use client";

import { useMemo, useState } from "react";
import { CreateClientDialog } from "./create-client-dialog";
import { useClients } from "./useClient";
import type { Client } from "./schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [search, setSearch] = useState("");
  const { data, isPending } = useClients(0, 100);

  const filtered = useMemo(() => {
    const clients = data?.content ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter(
      (client) => client.raisonSociale.toLowerCase().includes(query) || client.matricule.toLowerCase().includes(query),
    );
  }, [data, search]);

  function handleCreated(client: Client) {
    onChange(client.id);
  }

  if (isPending) return <Skeleton className="h-9 w-full" />;

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1 space-y-2">
        <Input
          placeholder="Rechercher par nom ou matricule…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select value={value ?? undefined} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choisir un client" />
          </SelectTrigger>
          <SelectContent>
            {filtered.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.raisonSociale} ({client.matricule})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <CreateClientDialog onCreated={handleCreated} />
    </div>
  );
}
