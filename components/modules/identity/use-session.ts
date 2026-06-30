"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/lib/constants";
import { fetchMe, logout } from "./auth-service";
import { hasDepartment, isAdmin, isManager, primaryDepartment, userDepartments } from "./auth-access";
import type { Department, MeResponse } from "./auth-schemas";

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
