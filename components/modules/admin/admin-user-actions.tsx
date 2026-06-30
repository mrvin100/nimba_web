"use client";

import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { ApiError } from "@/lib/api-error";
import { useSetUserStatus } from "./useAdmin";
import type { AdminUser, UserStatusAction } from "./schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ACTION_LABELS: Record<UserStatusAction, string> = {
  suspend: "Suspendre",
  reactivate: "Réactiver",
  revoke: "Révoquer",
};

/** Lifecycle transitions offered for a given current status. */
function actionsFor(user: AdminUser): UserStatusAction[] {
  switch (user.status) {
    case "ACTIVE":
      return ["suspend", "revoke"];
    case "SUSPENDED":
      return ["reactivate", "revoke"];
    case "REVOKED":
      return ["reactivate"];
  }
}

/** Row action menu for a managed user (suspend / reactivate / revoke). */
export function AdminUserActions({ user }: { user: AdminUser }) {
  const setStatus = useSetUserStatus();
  const actions = actionsFor(user);

  async function run(action: UserStatusAction) {
    try {
      await setStatus.mutateAsync({ id: user.id, action });
      toast.success(`${user.fullName} — ${ACTION_LABELS[action].toLowerCase()}`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Une erreur est survenue. Veuillez réessayer.");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" disabled={setStatus.isPending}>
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action}
            variant={action === "revoke" ? "destructive" : "default"}
            onSelect={() => run(action)}
          >
            {ACTION_LABELS[action]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
