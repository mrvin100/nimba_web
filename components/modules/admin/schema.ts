import { z } from "zod";
import type { PagedResponse } from "@/lib/pagination";
import { DEPARTMENTS, type AccountStatus, type Department, type Membership } from "@/components/modules/identity";

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
 * One role choice per direction plus the admin flag — the access-assignment part
 * shared by the create-user form and the edit-role dialog.
 */
export const membershipFieldsSchema = z.object({
  admin: z.boolean(),
  dri: z.enum(ROLE_CHOICES),
  dcm: z.enum(ROLE_CHOICES),
  drc: z.enum(ROLE_CHOICES),
  comite: z.enum(ROLE_CHOICES),
});

export type MembershipFieldsInput = z.infer<typeof membershipFieldsSchema>;

/**
 * Create-user form schema. No password: the account is created pending and the
 * user sets it via the invitation.
 */
export const createUserSchema = membershipFieldsSchema.extend({
  fullName: z.string().min(1, "Le nom complet est requis").max(200, "200 caractères maximum"),
  email: z.string().min(1, "Adresse e-mail requise").email("Adresse e-mail invalide"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/** Edit-role form schema: the same access fields, applied to an existing user. */
export const editMembershipsSchema = membershipFieldsSchema;
export type EditMembershipsInput = z.infer<typeof editMembershipsSchema>;

/** Request payload for POST /admin/users. */
export interface CreateUserPayload {
  fullName: string;
  email: string;
  admin: boolean;
  memberships: Membership[];
}

/** Request payload for PUT /admin/users/{id}/memberships. */
export interface UpdateMembershipsPayload {
  admin: boolean;
  memberships: Membership[];
}

/** Turns the flat role-choice fields into the API membership list (drops "NONE" directions). */
function toMemberships(values: MembershipFieldsInput): Membership[] {
  return DEPARTMENTS.flatMap((dept) => {
    const choice = values[dept.toLowerCase() as "dri" | "dcm" | "drc" | "comite"];
    return choice === "NONE" ? [] : [{ department: dept, role: choice }];
  });
}

/** Turns the create-user form values into the API payload. */
export function toCreateUserPayload(values: CreateUserInput): CreateUserPayload {
  return {
    fullName: values.fullName,
    email: values.email,
    admin: values.admin,
    memberships: toMemberships(values),
  };
}

/** Turns the edit-role form values into the API payload. */
export function toUpdateMembershipsPayload(values: EditMembershipsInput): UpdateMembershipsPayload {
  return { admin: values.admin, memberships: toMemberships(values) };
}

/** Whether the form grants any access at all (admin or at least one direction). */
export function hasAnyAssignment(values: MembershipFieldsInput): boolean {
  return values.admin || values.dri !== "NONE" || values.dcm !== "NONE" || values.drc !== "NONE" || values.comite !== "NONE";
}

/** Builds edit-role form defaults from a managed user's current memberships. */
export function toEditMembershipsDefaults(user: AdminUser): EditMembershipsInput {
  const roleFor = (dept: Department): RoleChoice => user.memberships.find((m) => m.department === dept)?.role ?? "NONE";
  return {
    admin: user.admin,
    dri: roleFor("DRI"),
    dcm: roleFor("DCM"),
    drc: roleFor("DRC"),
    comite: roleFor("COMITE"),
  };
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

/**
 * Organisation settings (sender identity for invitation e-mails, plus the two
 * standing signatories printed on generated legal documents — first
 * consumer: the Caution module's SMS/ACF).
 */
export interface OrganizationSettings {
  organizationName: string;
  senderName: string;
  senderEmail: string;
  hasLogo: boolean;
  signataire1Nom: string | null;
  signataire1Titre: string | null;
  signataire2Nom: string | null;
  signataire2Titre: string | null;
  updatedAt: string;
}

export const organizationSchema = z.object({
  organizationName: z.string().min(1, "Nom de l'organisation requis").max(200, "200 caractères maximum"),
  senderName: z.string().min(1, "Nom de l'expéditeur requis").max(200, "200 caractères maximum"),
  senderEmail: z.string().min(1, "Adresse e-mail requise").email("Adresse e-mail invalide"),
  signataire1Nom: z.string().max(200, "200 caractères maximum").optional(),
  signataire1Titre: z.string().max(200, "200 caractères maximum").optional(),
  signataire2Nom: z.string().max(200, "200 caractères maximum").optional(),
  signataire2Titre: z.string().max(200, "200 caractères maximum").optional(),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;

/** Aggregate user counts for the admin dashboard. */
export interface UserStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  revoked: number;
  byDepartment: { department: Department; count: number }[];
}

/** Aggregate credit-case counts for the admin dashboard. */
export interface DossierStats {
  total: number;
  byStatus: { status: "EN_ATTENTE_AMORTISSEMENT" | "TRADES_GENERES"; count: number }[];
}
