import { api } from "@/lib/api-client";
import type { AdminUser, AdminUserPage, CreateUserPayload, UserStatusAction } from "./admin-schemas";

/** Lists managed users, newest first (paginated). */
export function listUsers(page = 0, size = 20): Promise<AdminUserPage> {
  return api.get("admin/users", { searchParams: { page, size } }).json<AdminUserPage>();
}

/** Creates a user with its memberships and admin flag. */
export function createUser(payload: CreateUserPayload): Promise<AdminUser> {
  return api.post("admin/users", { json: payload }).json<AdminUser>();
}

/** Applies a lifecycle transition (suspend / reactivate / revoke). */
export function setUserStatus(id: string, action: UserStatusAction): Promise<AdminUser> {
  return api.post(`admin/users/${id}/${action}`).json<AdminUser>();
}
