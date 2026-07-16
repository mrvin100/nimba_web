"use client";

import { useState } from "react";
import { KeyRound, UserCog } from "lucide-react";
import { useSession } from "@/components/modules/identity";
import { StatusActionMenu } from "@/components/shared/status-action-menu";
import { useResetUserPassword, useSetUserStatus } from "./useAdmin";
import { EditRoleDialog } from "./edit-role-dialog";
import type { AdminUser } from "./schema";

/** Row action menu for a managed user: edit roles, reset password, lifecycle transitions. */
export function AdminUserActions({ user }: { user: AdminUser }) {
  const { user: currentUser } = useSession();
  const setStatus = useSetUserStatus();
  const resetPassword = useResetUserPassword();
  const [editOpen, setEditOpen] = useState(false);

  // An admin cannot act on their own account (matches the backend guard); the
  // menu is simply hidden for the current user's own row.
  if (currentUser?.userId === user.id) {
    return null;
  }

  return (
    <>
      <StatusActionMenu
        name={user.fullName}
        status={user.status}
        pending={setStatus.isPending}
        onAction={(action) => setStatus.mutateAsync({ id: user.id, action })}
        extraActions={[
          { key: "edit-role", label: "Modifier les rôles", icon: UserCog, onSelect: () => setEditOpen(true) },
          {
            key: "reset-password",
            label: "Mot de passe oublié",
            icon: KeyRound,
            disabled: resetPassword.isPending,
            onSelect: () => resetPassword.mutate(user.id),
          },
        ]}
      />
      <EditRoleDialog user={user} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
