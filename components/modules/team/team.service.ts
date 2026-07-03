import { api } from "@/lib/api-client";
import type { InvitedMember, InviteMemberPayload, MemberStatusAction, TeamMember } from "./schema";

/** Invites a member into a direction the caller manages. */
export function inviteMember(payload: InviteMemberPayload): Promise<InvitedMember> {
  return api.post("team/members", { json: payload }).json<InvitedMember>();
}

/** The members of the directions the caller manages. */
export function listMembers(): Promise<TeamMember[]> {
  return api.get("team/members").json<TeamMember[]>();
}

/** Applies a lifecycle transition to a managed member. */
export function setMemberStatus(id: string, action: MemberStatusAction): Promise<TeamMember> {
  return api.post(`team/members/${id}/${action}`).json<TeamMember>();
}
