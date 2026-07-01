import { api } from "@/lib/api-client";
import type { InvitedMember, InviteMemberPayload } from "./schema";

/** Invites a member into a direction the caller manages. */
export function inviteMember(payload: InviteMemberPayload): Promise<InvitedMember> {
  return api.post("team/members", { json: payload }).json<InvitedMember>();
}
