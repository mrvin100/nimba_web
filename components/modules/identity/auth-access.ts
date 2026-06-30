import { ROUTES } from "@/lib/constants";
import { DEPARTMENTS, type Department, type MeResponse } from "./auth-schemas";

/**
 * Pure capability helpers derived from a {@link MeResponse}. Kept free of React so
 * they can be used both inside hooks ({@link useSession}) and at redirect time
 * (the login form, the workspace guard), with one definition of "what can this
 * user do".
 */

/** The directions the user belongs to, ordered by process priority (DRI > DCM > DRC). */
export function userDepartments(user: MeResponse): Department[] {
  return DEPARTMENTS.filter((dept) => user.memberships.some((m) => m.department === dept));
}

/** The user's highest-priority direction, or null for an admin-only account. */
export function primaryDepartment(user: MeResponse): Department | null {
  return userDepartments(user)[0] ?? null;
}

/** Whether the user is a platform administrator (manages users, not a direction). */
export function isAdmin(user: MeResponse): boolean {
  return user.admin;
}

/** Whether the user belongs to the given direction (any role). */
export function hasDepartment(user: MeResponse, dept: Department): boolean {
  return user.memberships.some((m) => m.department === dept);
}

/** Whether the user manages the given direction (manager inherits member access). */
export function isManager(user: MeResponse, dept: Department): boolean {
  return user.memberships.some((m) => m.department === dept && m.role === "MANAGER");
}

/** Route for a direction's workspace (e.g. DRI -> /dri). */
export function departmentPath(dept: Department): string {
  return `/${dept.toLowerCase()}`;
}

/**
 * Where to send a user after login. Admins land on the admin console; everyone
 * else on their highest-priority direction. An account with neither is sent back
 * to login (it cannot do anything — the backend should not issue such a session).
 */
export function landingPath(user: MeResponse): string {
  if (isAdmin(user)) {
    return ROUTES.ADMIN;
  }
  const primary = primaryDepartment(user);
  return primary ? departmentPath(primary) : ROUTES.LOGIN;
}
