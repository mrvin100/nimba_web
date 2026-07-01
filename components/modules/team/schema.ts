import { z } from "zod";
import type { AccountStatus, Department, Membership } from "@/components/modules/identity";

/** Manager invite form: a manager provisions a member of their direction. */
export const inviteMemberSchema = z.object({
  fullName: z.string().min(1, "Le nom complet est requis").max(200, "200 caractères maximum"),
  email: z.string().min(1, "Adresse e-mail requise").email("Adresse e-mail invalide"),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

/** Request payload for POST /team/members. */
export interface InviteMemberPayload extends InviteMemberInput {
  department: Department;
}

/** Minimal response of a team invite. */
export interface InvitedMember {
  email: string;
  fullName: string;
}

/** A member managed by a direction manager. */
export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  status: AccountStatus;
  pending: boolean;
  admin: boolean;
  memberships: Membership[];
  createdAt: string;
}

/** Lifecycle transitions a manager can apply to a member. */
export type MemberStatusAction = "suspend" | "reactivate" | "revoke";
