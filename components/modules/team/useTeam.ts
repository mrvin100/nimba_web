"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { queryKeys } from "@/lib/query-keys";
import { inviteMember, listMembers, setMemberStatus } from "./team-service";
import type { MemberStatusAction } from "./schema";

/** Query keys for the team domain. */
export const teamKeys = queryKeys("team-members");

/** The members of the directions the caller manages (server state). */
export function useTeamMembers() {
  return useQuery({
    queryKey: teamKeys.all,
    queryFn: listMembers,
  });
}

/** Invites a member into a managed direction and refreshes the member list. */
export function useInviteMember() {
  return useApiMutation({
    mutationFn: inviteMember,
    invalidate: [teamKeys.all],
  });
}

/** Applies a lifecycle transition to a member and refreshes the list. */
export function useSetMemberStatus() {
  return useApiMutation({
    mutationFn: ({ id, action }: { id: string; action: MemberStatusAction }) => setMemberStatus(id, action),
    invalidate: [teamKeys.all],
  });
}
