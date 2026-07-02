"use client";

import { useSession } from "@/components/modules/identity";
import { StatusActionMenu } from "@/components/shared/status-action-menu";
import { useSetUserStatus } from "./useAdmin";
import type { AdminUser } from "./schema";

/** Row action menu for a managed user (suspend / reactivate / revoke). */
export function AdminUserActions({ user }: { user: AdminUser }) {
  const { user: currentUser } = useSession();
  const setStatus = useSetUserStatus();

  // An admin cannot act on their own account (matches the backend guard); the
  // menu is simply hidden for the current user's own row.
  if (currentUser?.userId === user.id) {
    return null;
  }

  return (
    <StatusActionMenu
      name={user.fullName}
      status={user.status}
      pending={setStatus.isPending}
      onAction={(action) => setStatus.mutateAsync({ id: user.id, action })}
    />
  );
}
