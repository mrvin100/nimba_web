"use client";

import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { ApiError } from "@/lib/api-error";
import { useSetMemberStatus } from "./useTeam";
import type { MemberStatusAction, TeamMember } from "./schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ACTION_LABELS: Record<MemberStatusAction, string> = {
  suspend: "Suspendre",
  reactivate: "Réactiver",
  revoke: "Révoquer",
};

function actionsFor(member: TeamMember): MemberStatusAction[] {
  switch (member.status) {
    case "ACTIVE":
      return ["suspend", "revoke"];
    case "SUSPENDED":
      return ["reactivate", "revoke"];
    case "REVOKED":
      return ["reactivate"];
  }
}

/** Row actions for a managed member (suspend / reactivate / revoke). */
export function MemberActions({ member }: { member: TeamMember }) {
  const setStatus = useSetMemberStatus();

  async function run(action: MemberStatusAction) {
    try {
      await setStatus.mutateAsync({ id: member.id, action });
      toast.success(`${member.fullName} — ${ACTION_LABELS[action].toLowerCase()}`);
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
        {actionsFor(member).map((action) => (
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
