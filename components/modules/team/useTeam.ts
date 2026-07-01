"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inviteMember, listMembers, setMemberStatus } from "./team-service";
import type { MemberStatusAction } from "./schema";

/** Query keys for the team domain. */
export const teamKeys = {
  members: ["team-members"] as const,
};

/** Invites a member into a managed direction and refreshes the member list. */
export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inviteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members });
    },
  });
}

/** The members of the directions the caller manages (server state). */
export function useTeamMembers() {
  return useQuery({
    queryKey: teamKeys.members,
    queryFn: listMembers,
  });
}

/** Applies a lifecycle transition to a member and refreshes the list. */
export function useSetMemberStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: MemberStatusAction }) => setMemberStatus(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members });
    },
  });
}
