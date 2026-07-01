"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  getOrganization,
  importBulkUsers,
  listUsers,
  previewBulkUsers,
  setUserStatus,
  updateOrganization,
} from "./admin-service";
import type { UserStatusAction } from "./schema";

/** Query keys for the admin domain (single source for cache invalidation). */
export const adminKeys = {
  all: ["admin-users"] as const,
  list: (page: number, size: number) => ["admin-users", "list", page, size] as const,
  organization: ["admin-organization"] as const,
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

/** Previews a bulk import CSV (no persistence). */
export function usePreviewBulkUsers() {
  return useMutation({ mutationFn: previewBulkUsers });
}

/** Commits a bulk import and refreshes the list on success. */
export function useImportBulkUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importBulkUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

/** Organisation settings (server state). */
export function useOrganization() {
  return useQuery({
    queryKey: adminKeys.organization,
    queryFn: getOrganization,
  });
}

/** Updates organisation settings and refreshes the cache. */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrganization,
    onSuccess: (data) => {
      queryClient.setQueryData(adminKeys.organization, data);
    },
  });
}
