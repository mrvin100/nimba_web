"use client";

import { StatusActionMenu } from "@/components/shared/status-action-menu";
import { useSetMemberStatus } from "./useTeam";
import type { TeamMember } from "./schema";

/** Row actions for a managed member (suspend / reactivate / revoke). */
export function MemberActions({ member }: Readonly<{ member: TeamMember }>) {
  const setStatus = useSetMemberStatus();

  return (
    <StatusActionMenu
      name={member.fullName}
      status={member.status}
      pending={setStatus.isPending}
      onAction={(action) => setStatus.mutateAsync({ id: member.id, action })}
    />
  );
}
