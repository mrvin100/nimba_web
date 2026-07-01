"use client";

import { useMutation } from "@tanstack/react-query";
import { inviteMember } from "./team-service";

/** Invites a member into a managed direction. */
export function useInviteMember() {
  return useMutation({ mutationFn: inviteMember });
}
