"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/lib/constants";
import {
  bootstrap,
  bootstrapStatus,
  deleteAvatar,
  fetchInvitation,
  fetchMe,
  fetchPublicOrganization,
  logout,
  setPassword,
  updateProfile,
  uploadAvatar,
} from "./auth-service";
import { hasDepartment, isAdmin, isManager, primaryDepartment, userDepartments } from "./auth-access";
import type { Department, MeResponse } from "./schema";

/** Query key for the current session (single source for cache invalidation on logout). */
export const sessionKeys = {
  me: ["session", "me"] as const,
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
    queryKey: sessionKeys.me,
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

/** Whether the one-time first-admin bootstrap is still available. */
export function useBootstrapStatus() {
  return useQuery({
    queryKey: ["bootstrap", "status"],
    queryFn: bootstrapStatus,
    staleTime: 0,
  });
}

/** Creates the first platform administrator. */
export function useBootstrap() {
  return useMutation({ mutationFn: bootstrap });
}

/** Validates an invitation token (for the set-password page). */
export function useInvitation(token: string) {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: () => fetchInvitation(token),
    retry: false,
    enabled: token.length > 0,
  });
}

/** Sets the account password from an invitation token. */
export function useSetPassword() {
  return useMutation({ mutationFn: setPassword });
}

/** Updates the current user's profile and refreshes the cached session. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(sessionKeys.me, data);
    },
  });
}

/** Uploads the current user's avatar and refreshes the cached session. */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      queryClient.setQueryData(sessionKeys.me, data);
    },
  });
}

/** Removes the current user's avatar and refreshes the cached session. */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAvatar,
    onSuccess: (data) => {
      queryClient.setQueryData(sessionKeys.me, data);
    },
  });
}

/** Public organisation name (used by the login screen and the shell). */
export function useOrganizationName() {
  return useQuery({
    queryKey: ["public-organization"],
    queryFn: fetchPublicOrganization,
    staleTime: 5 * 60 * 1000,
  });
}

/** Ends the session, clears the cached session, and returns to the login page. */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      router.replace(ROUTES.LOGIN);
      router.refresh();
    },
  });
}
