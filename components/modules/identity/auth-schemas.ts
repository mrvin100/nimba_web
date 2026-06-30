import { z } from "zod";

/** Login form schema; the inferred type is the request payload (one source of truth). */
export const loginSchema = z.object({
  email: z.string().min(1, "Adresse e-mail requise").email("Adresse e-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Directions, in process order (declaration order = landing priority). */
export const DEPARTMENTS = ["DRI", "DCM", "DRC"] as const;
export type Department = (typeof DEPARTMENTS)[number];

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
  memberships: Membership[];
}
