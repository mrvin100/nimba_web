import { z } from "zod";

/** Login form schema; the inferred type is the request payload (one source of truth). */
export const loginSchema = z.object({
  email: z.string().min(1, "Adresse e-mail requise").email("Adresse e-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Directions, in process order (declaration order = landing priority). */
export const DEPARTMENTS = ["DRI", "DCM", "DRC", "COMITE"] as const;
export type Department = (typeof DEPARTMENTS)[number];

/** Human-readable direction names (single source for every label in the UI). */
export const DEPARTMENT_LABELS: Record<Department, string> = {
  DRI: "Direction Recherches et Investissement",
  DCM: "Direction Crédit et Marketing",
  DRC: "Direction Risque et Conformité",
  COMITE: "Comité de Crédit",
};

/** Role held within a direction (a manager inherits member access). */
export const DEPARTMENT_ROLES = ["MANAGER", "MEMBER"] as const;
export type DepartmentRole = (typeof DEPARTMENT_ROLES)[number];

/** Account lifecycle; only ACTIVE accounts can authenticate. */
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "REVOKED";

/** One (direction, role) assignment. A user holds at most one role per direction. */
export interface Membership {
  department: Department;
  role: DepartmentRole;
}

/** Authenticated user, as returned by /auth/me and /auth/login. */
export interface MeResponse {
  userId: string;
  fullName: string;
  email: string;
  status: AccountStatus;
  admin: boolean;
  hasAvatar: boolean;
  memberships: Membership[];
}

/** One-time first-admin bootstrap form (self-sets its own password). */
export const bootstrapSchema = z.object({
  fullName: z.string().min(1, "Nom complet requis").max(200, "200 caractères maximum"),
  email: z.string().min(1, "Adresse e-mail requise").email("Adresse e-mail invalide"),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
});

export type BootstrapInput = z.infer<typeof bootstrapSchema>;

/** Whether the first-admin bootstrap is still available. */
export interface BootstrapStatus {
  available: boolean;
}

/** Set-password form (from an invitation). The token comes from the URL. */
export const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
    confirm: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

export type SetPasswordInput = z.infer<typeof setPasswordSchema>;

/** Invited user's identity, for the set-password page. */
export interface InvitationInfo {
  fullName: string;
  email: string;
}

/** Self-service profile edit (display name). */
export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Nom complet requis").max(200, "200 caractères maximum"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** Public organisation identity (name and whether a logo is configured). */
export interface PublicOrganization {
  organizationName: string;
  hasLogo: boolean;
}
