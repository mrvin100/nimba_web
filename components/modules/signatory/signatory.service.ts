import { api } from "@/lib/api-client";
import type { Signatory, SignatoryInput, SignatoryOption } from "./schema";

/** Every signatory candidate the caller may pick (profiles + authorized standalone records). */
export function listSignatoryOptions(): Promise<SignatoryOption[]> {
  return api.get("signatories").json<SignatoryOption[]>();
}

/** Every standalone signatory, unfiltered — the admin management view. */
export function listSignatories(): Promise<Signatory[]> {
  return api.get("admin/signatories").json<Signatory[]>();
}

export function createSignatory(input: SignatoryInput): Promise<Signatory> {
  return api.post("admin/signatories", { json: input }).json<Signatory>();
}

export function updateSignatory(id: string, input: SignatoryInput): Promise<Signatory> {
  return api.put(`admin/signatories/${id}`, { json: input }).json<Signatory>();
}

export async function deleteSignatory(id: string): Promise<void> {
  await api.delete(`admin/signatories/${id}`);
}
