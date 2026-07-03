"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { QUERY_SCOPES } from "@/lib/query-keys";
import { ROUTES } from "@/lib/constants";
import {
  bootstrap,
  bootstrapStatus,
  deleteAvatar,
  fetchInvitation,
  fetchMe,
  fetchPublicOrganization,
  login,
  logout,
  setPassword,
  updateProfile,
  uploadAvatar,
} from "./identity.service";
import { hasDepartment, isAdmin, isManager, landingPath, primaryDepartment, userDepartments } from "./auth-access";
import type { Department, MeResponse } from "./schema";

/**
 * Every identity cache key, in one object on the module's central scope —
 * queries are always addressed through these entries, never a raw string.
 */
export const identityKeys = {
  session: [QUERY_SCOPES.identity, "session"] as const,
  bootstrap: [QUERY_SCOPES.identity, "bootstrap"] as const,
  invitation: (token: string) => [QUERY_SCOPES.identity, "invitation", token] as const,
  organization: [QUERY_SCOPES.identity, "organization"] as const,
};

export interface Session {
  loading: boolean;
  user: MeResponse | null;
  isAdmin: boolean;
  departments: Department[];
  primaryDepartment: Department | null;
  hasDepartment: (dept: Department) => boolean;
  isManager: (dept: Department) => boolean;
}

/**
 * Current-session hook backed by TanStack Query: reads /auth/me and exposes the
 * capability helpers ({@link isAdmin}, {@link isManager}, …) bound to the resolved
 * user, so UI gating reads naturally (`session.isManager("DRI")`). A 401 resolves
 * to `user: null` rather than an error — being unauthenticated is an expected state.
 */
export function useSession(): Session {
  const { data, isPending } = useQuery({
    queryKey: identityKeys.session,
    queryFn: () => fetchMe().catch(() => null),
    staleTime: 5 * 60 * 1000,
  });

  const user = data ?? null;

  return {
    loading: isPending,
    user,
    isAdmin: user ? isAdmin(user) : false,
    departments: user ? userDepartments(user) : [],
    primaryDepartment: user ? primaryDepartment(user) : null,
    hasDepartment: (dept) => (user ? hasDepartment(user, dept) : false),
    isManager: (dept) => (user ? isManager(user, dept) : false),
  };
}

/**
 * Signs in, PRIMES the session cache with the returned analyst, then lands the
 * user on their board. Two deliberate choices live here (not in the form):
 * - write-through of the session key — without it the cached `null` (staleTime)
 *   would bounce the user straight back to /login;
 * - HARD navigation — a soft router.replace() would reuse the Router Cache
 *   built while signed out (where the proxy redirected the workspace back to
 *   /login): the classic "spinner loops, never lands on the board" bug.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(identityKeys.session, user);
      window.location.replace(landingPath(user));
    },
  });
}

/** Whether the one-time first-admin bootstrap is still available. */
export function useBootstrapStatus() {
  return useQuery({
    queryKey: identityKeys.bootstrap,
    queryFn: bootstrapStatus,
    staleTime: 0,
  });
}

/** Creates the first platform administrator and confirms. */
export function useBootstrap() {
  return useApiMutation({
    mutationFn: bootstrap,
    successToast: "Administrateur créé. Vous pouvez vous connecter.",
  });
}

/** Validates an invitation token (for the set-password page). */
export function useInvitation(token: string) {
  return useQuery({
    queryKey: identityKeys.invitation(token),
    queryFn: () => fetchInvitation(token),
    retry: false,
    enabled: token.length > 0,
  });
}

/** Sets the account password from an invitation token and confirms. */
export function useSetPassword() {
  return useApiMutation({
    mutationFn: setPassword,
    successToast: "Mot de passe défini. Vous pouvez vous connecter.",
  });
}

/** Updates the profile, refreshes the cached session, and confirms. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: updateProfile,
    successToast: "Profil mis à jour",
    onSuccess: (data) => {
      queryClient.setQueryData(identityKeys.session, data);
    },
  });
}

/** Uploads the avatar, refreshes the cached session, and reports the outcome. */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: uploadAvatar,
    successToast: "Photo mise à jour",
    errorToast: true,
    onSuccess: (data) => {
      queryClient.setQueryData(identityKeys.session, data);
    },
  });
}

/** Removes the avatar, refreshes the cached session, and reports the outcome. */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: deleteAvatar,
    successToast: "Photo supprimée",
    errorToast: true,
    onSuccess: (data) => {
      queryClient.setQueryData(identityKeys.session, data);
    },
  });
}

/** Public organisation name (used by the login screen and the shell). */
export function useOrganizationName() {
  return useQuery({
    queryKey: identityKeys.organization,
    queryFn: fetchPublicOrganization,
    staleTime: 5 * 60 * 1000,
  });
}

/** Ends the session, clears every cache, and returns to the login page. */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      // Hard navigation: the auth state changed, so the Router Cache built
      // while signed in must not be reused (same rule as after login).
      window.location.replace(ROUTES.LOGIN);
    },
  });
}
