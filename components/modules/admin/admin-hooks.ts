"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, listUsers, setUserStatus } from "./admin-service";
import type { UserStatusAction } from "./admin-schemas";

/** Query keys for the admin user domain (single source for cache invalidation). */
export const adminKeys = {
  all: ["admin-users"] as const,
  list: (page: number, size: number) => ["admin-users", "list", page, size] as const,
};

/** Paginated list of managed users (server state). */
export function useAdminUsers(page: number, size = 20) {
  return useQuery({
    queryKey: adminKeys.list(page, size),
    queryFn: () => listUsers(page, size),
  });
}

/** Creates a user and refreshes the list on success. */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

/** Applies a lifecycle transition and refreshes the list on success. */
export function useSetUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: UserStatusAction }) => setUserStatus(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
