import { api } from "@/lib/api-client";
import type {
  BootstrapInput,
  BootstrapStatus,
  InvitationInfo,
  LoginInput,
  MeResponse,
  PublicOrganization,
  UpdateProfileInput,
} from "./schema";

/** Authenticates and establishes the session cookie; returns the analyst. */
export function login(input: LoginInput): Promise<MeResponse> {
  return api.post("auth/login", { json: input }).json<MeResponse>();
}

/** Invalidates the session. */
export async function logout(): Promise<void> {
  await api.post("auth/logout");
}

/** Resolves the current analyst, or throws (e.g. ApiError 401) when not authenticated. */
export function fetchMe(): Promise<MeResponse> {
  return api.get("auth/me").json<MeResponse>();
}

/** Whether the one-time first-admin bootstrap is still available. */
export function bootstrapStatus(): Promise<BootstrapStatus> {
  return api.get("auth/bootstrap").json<BootstrapStatus>();
}

/** Creates the first platform administrator (one-time). */
export async function bootstrap(input: BootstrapInput): Promise<void> {
  await api.post("auth/bootstrap", { json: input });
}

/** Validates an invitation token and returns the invited user's identity. */
export function fetchInvitation(token: string): Promise<InvitationInfo> {
  return api.get(`auth/invitations/${token}`).json<InvitationInfo>();
}

/** Sets the account password from a valid invitation token. */
export async function setPassword(payload: { token: string; password: string }): Promise<void> {
  await api.post("auth/set-password", { json: payload });
}

/** Updates the current user's own profile (display name). */
export function updateProfile(input: UpdateProfileInput): Promise<MeResponse> {
  return api.put("auth/profile", { json: input }).json<MeResponse>();
}

/** Public organisation name (no auth required). */
export function fetchPublicOrganization(): Promise<PublicOrganization> {
  return api.get("auth/organization").json<PublicOrganization>();
}
