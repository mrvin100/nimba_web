import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { env } from "@/lib/env";
import type {
  AdminUser,
  AdminUserPage,
  BulkImportResult,
  BulkPreviewResponse,
  CreateUserPayload,
  DossierStats,
  OrganizationInput,
  OrganizationSettings,
  UpdateMembershipsPayload,
  UserStats,
  UserStatusAction,
} from "./schema";

/** Lists managed users, newest first (paginated). */
export function listUsers(page = 0, size = 20): Promise<AdminUserPage> {
  return api.get("admin/users", { searchParams: { page, size } }).json<AdminUserPage>();
}

/** Creates a user (invited); returns the pending account. */
export function createUser(payload: CreateUserPayload): Promise<AdminUser> {
  return api.post("admin/users", { json: payload }).json<AdminUser>();
}

/** Applies a lifecycle transition (suspend / reactivate / revoke). */
export function setUserStatus(id: string, action: UserStatusAction): Promise<AdminUser> {
  return api.post(`admin/users/${id}/${action}`).json<AdminUser>();
}

/** Sends a password-reset e-mail so the user can set a new password themselves. */
export function resetUserPassword(id: string): Promise<AdminUser> {
  return api.post(`admin/users/${id}/reset-password`).json<AdminUser>();
}

/** Replaces a user's directions/role and admin flag. */
export function updateUserMemberships(id: string, payload: UpdateMembershipsPayload): Promise<AdminUser> {
  return api.put(`admin/users/${id}/memberships`, { json: payload }).json<AdminUser>();
}

/** Same-origin URL of the bulk import CSV template (used as an anchor href). */
export function bulkTemplatePath(): string {
  return `${env.apiBasePath}/admin/users/import/template`;
}

/** Parses and validates a bulk import CSV without persisting. */
export function previewBulkUsers(file: File): Promise<BulkPreviewResponse> {
  const body = new FormData();
  body.append("file", file);
  return api.post("admin/users/import/preview", { body }).json<BulkPreviewResponse>();
}

/**
 * Domain outcome of an all-or-nothing import rejected by the backend (422):
 * nothing was created and the response carries the per-line preview. Thrown
 * here — the module's one entry point — so the UI reacts to a typed outcome
 * and never inspects HTTP statuses itself.
 */
export class BulkImportRejectedError extends Error {
  constructor(readonly preview: BulkPreviewResponse) {
    super("Certaines lignes sont invalides. Corrigez le fichier.");
    this.name = "BulkImportRejectedError";
  }
}

/** Commits a bulk import (all-or-nothing); throws [BulkImportRejectedError] on invalid lines. */
export async function importBulkUsers(file: File): Promise<BulkImportResult> {
  const body = new FormData();
  body.append("file", file);
  try {
    return await api.post("admin/users/import", { body }).json<BulkImportResult>();
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      throw new BulkImportRejectedError(error.problem as unknown as BulkPreviewResponse);
    }
    throw error;
  }
}

/** Reads the organisation settings. */
export function getOrganization(): Promise<OrganizationSettings> {
  return api.get("admin/organization").json<OrganizationSettings>();
}

/** Updates the organisation settings. */
export function updateOrganization(payload: OrganizationInput): Promise<OrganizationSettings> {
  return api.put("admin/organization", { json: payload }).json<OrganizationSettings>();
}

/** Uploads the organisation logo image (used on generated documents and the login screen). */
export function uploadOrganizationLogo(file: File): Promise<OrganizationSettings> {
  const body = new FormData();
  body.append("file", file);
  return api.post("admin/organization/logo", { body }).json<OrganizationSettings>();
}

/** Removes the organisation logo. */
export function deleteOrganizationLogo(): Promise<OrganizationSettings> {
  return api.delete("admin/organization/logo").json<OrganizationSettings>();
}

/** Same-origin URL of the organisation logo image (for an `<img>` source). */
export function organizationLogoPath(): string {
  return `${env.apiBasePath}/admin/organization/logo`;
}

/** Aggregate user counts for the admin dashboard. */
export function getUserStats(): Promise<UserStats> {
  return api.get("admin/stats/users").json<UserStats>();
}

/** Aggregate credit-case counts for the admin dashboard. */
export function getDossierStats(): Promise<DossierStats> {
  return api.get("admin/stats/dossiers").json<DossierStats>();
}
