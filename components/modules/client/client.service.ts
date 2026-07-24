import { api } from "@/lib/api-client";
import type { PagedResponse } from "@/lib/pagination";
import type { Client, ClientFormInput, ClientSummary, CreateClientInput } from "./schema";

/** Lists clients, alphabetical (paginated). */
export function listClients(page = 0, size = 20): Promise<PagedResponse<ClientSummary>> {
  return api.get("clients", { searchParams: { page, size } }).json<PagedResponse<ClientSummary>>();
}

/** Resolves a single client by id. */
export function getClient(id: string): Promise<Client> {
  return api.get(`clients/${id}`).json<Client>();
}

/** Registers a client (409 if the matricule is already taken). */
export function createClient(input: CreateClientInput): Promise<Client> {
  return api.post("clients", { json: input }).json<Client>();
}

/** Updates a client's descriptive details (matricule never changes). */
export function updateClient(id: string, input: ClientFormInput): Promise<Client> {
  return api.put(`clients/${id}`, { json: input }).json<Client>();
}
