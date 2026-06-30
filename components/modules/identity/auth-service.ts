import { api } from "@/lib/api-client";
import type { LoginInput, MeResponse } from "./auth-schemas";

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
