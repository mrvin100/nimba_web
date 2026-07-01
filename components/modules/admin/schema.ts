import { z } from "zod";
import type { PagedResponse } from "@/lib/pagination";
import { DEPARTMENTS, type AccountStatus, type Membership } from "@/components/modules/identity";

/** A managed user, as returned by the admin endpoints. */
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  status: AccountStatus;
  /** True until the user has set a password via their invitation. */
  pending: boolean;
  admin: boolean;
  memberships: Membership[];
  createdAt: string;
}

/** Backend pagination envelope for the admin user list. */
export type AdminUserPage = PagedResponse<AdminUser>;

/** Lifecycle transitions exposed as explicit admin actions. */
export type UserStatusAction = "suspend" | "reactivate" | "revoke";

/**
 * Per-direction role choice in the create form. "NONE" means the user is not part
 * of that direction; it is filtered out when building the membership payload.
 */
export const ROLE_CHOICES = ["NONE", "MEMBER", "MANAGER"] as const;
export type RoleChoice = (typeof ROLE_CHOICES)[number];

/**
 * Create-user form schema. One role choice per direction plus the admin flag. No
 * password: the account is created pending and the user sets it via the invitation.
 */
export const createUserSchema = z.object({
  fullName: z.string().min(1, "Le nom complet est requis").max(200, "200 caractères maximum"),
  email: z.string().min(1, "Adresse e-mail requise").email("Adresse e-mail invalide"),
  admin: z.boolean(),
  dri: z.enum(ROLE_CHOICES),
  dcm: z.enum(ROLE_CHOICES),
  drc: z.enum(ROLE_CHOICES),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/** Request payload for POST /admin/users. */
export interface CreateUserPayload {
  fullName: string;
  email: string;
  admin: boolean;
  memberships: Membership[];
}

/** Turns the flat form values into the API payload (drops "NONE" directions). */
export function toCreateUserPayload(values: CreateUserInput): CreateUserPayload {
  const memberships: Membership[] = DEPARTMENTS.flatMap((dept) => {
    const choice = values[dept.toLowerCase() as "dri" | "dcm" | "drc"];
    return choice === "NONE" ? [] : [{ department: dept, role: choice }];
  });
  return {
    fullName: values.fullName,
    email: values.email,
    admin: values.admin,
    memberships,
  };
}

/** Whether the form grants any access at all (admin or at least one direction). */
export function hasAnyAssignment(values: CreateUserInput): boolean {
  return values.admin || values.dri !== "NONE" || values.dcm !== "NONE" || values.drc !== "NONE";
}

/** One evaluated row of a bulk import CSV. */
export interface BulkPreviewRow {
  lineNumber: number;
  fullName: string;
  email: string;
  department: string | null;
  role: string | null;
  admin: boolean;
  valid: boolean;
  errors: string[];
}

/** Bulk import preview (or 422 rejection) response. */
export interface BulkPreviewResponse {
  valid: boolean;
  validCount: number;
  invalidCount: number;
  rows: BulkPreviewRow[];
}

/** Result of a committed bulk import. */
export interface BulkImportResult {
  created: number;
}

/** Organisation settings (sender identity for invitation e-mails). */
export interface OrganizationSettings {
  organizationName: string;
  senderName: string;
  senderEmail: string;
  hasLogo: boolean;
  updatedAt: string;
}

export const organizationSchema = z.object({
  organizationName: z.string().min(1, "Nom de l'organisation requis").max(200, "200 caractères maximum"),
  senderName: z.string().min(1, "Nom de l'expéditeur requis").max(200, "200 caractères maximum"),
  senderEmail: z.string().min(1, "Adresse e-mail requise").email("Adresse e-mail invalide"),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
