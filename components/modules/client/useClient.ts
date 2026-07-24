"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { queryKeys } from "@/lib/query-keys";
import { usePagedQuery } from "@/lib/use-paged-query";
import { createClient, getClient, listClients, updateClient } from "./client.service";
import type { ClientFormInput } from "./schema";

export const clientKeys = queryKeys("client");

/** Paginated list of clients (server state). */
export function useClients(page: number, size = 20) {
  return usePagedQuery({
    keys: clientKeys,
    page,
    size,
    fetch: (p, s) => listClients(p, s),
  });
}

/** A single client by id (server state). */
export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => getClient(id),
  });
}

/** Registers a client; refreshes the list and confirms with its matricule. */
export function useCreateClient() {
  return useApiMutation({
    mutationFn: createClient,
    invalidate: [clientKeys.all],
    successToast: (created) => `Client ${created.matricule} enregistré`,
    errorToast: true,
  });
}

/** Updates a client's descriptive details; refreshes its detail. */
export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (input: ClientFormInput) => updateClient(id, input),
    invalidate: [clientKeys.lists()],
    successToast: "Client mis à jour",
    errorToast: true,
    onSuccess: (data) => {
      queryClient.setQueryData(clientKeys.detail(id), data);
    },
  });
}
