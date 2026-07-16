import { api } from "@/lib/api-client";
import { env } from "@/lib/env";
import type { Guarantee, GuaranteeFormInput } from "./schema";

const basePath = (caseId: string) => `credit-cases/${caseId}/guarantees`;

/** A case's guarantees, oldest first. */
export function listGuarantees(caseId: string): Promise<Guarantee[]> {
  return api.get(basePath(caseId)).json<Guarantee[]>();
}

export function createGuarantee(caseId: string, input: GuaranteeFormInput): Promise<Guarantee> {
  return api.post(basePath(caseId), { json: input }).json<Guarantee>();
}

export function updateGuarantee(caseId: string, id: string, input: GuaranteeFormInput): Promise<Guarantee> {
  return api.put(`${basePath(caseId)}/${id}`, { json: input }).json<Guarantee>();
}

export async function deleteGuarantee(caseId: string, id: string): Promise<void> {
  await api.delete(`${basePath(caseId)}/${id}`);
}

/** Uploads a proof file and returns the guarantee with the new attachment included. */
export function uploadGuaranteeAttachment(caseId: string, guaranteeId: string, file: File): Promise<Guarantee> {
  const body = new FormData();
  body.append("file", file);
  return api.post(`${basePath(caseId)}/${guaranteeId}/attachments`, { body }).json<Guarantee>();
}

/** Removes a file and returns the guarantee without it. */
export function deleteGuaranteeAttachment(caseId: string, guaranteeId: string, attachmentId: string): Promise<Guarantee> {
  return api.delete(`${basePath(caseId)}/${guaranteeId}/attachments/${attachmentId}`).json<Guarantee>();
}

/** Same-origin URL of a proof file; used as a link href so the browser downloads it with the session cookie. */
export function guaranteeAttachmentDownloadPath(caseId: string, guaranteeId: string, attachmentId: string): string {
  return `${env.apiBasePath}/${basePath(caseId)}/${guaranteeId}/attachments/${attachmentId}`;
}
